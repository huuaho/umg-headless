# Remediation Design — Deferred Photo-Competition Security/Privacy/Integrity Issues

Concrete build spec for fixing audit items I-4, I-6, I-7, I-9, I-10 when the photo-competition pipeline migrates off WordPress plugins onto the custom Node/Postgres backend.

## Scope & source of truth

These five items were deferred in [`docs/future-work/payment-pipeline-audit.md`](../payment-pipeline-audit.md) because none of them breaks the honest happy path — they are abuse/privacy/integrity risks, not functional bugs. The target architecture is [`claude-context/custom-backend-plan.md`](../../../claude-context/custom-backend-plan.md): a **Node/Express or Next.js API + PostgreSQL** service, with **Cloudinary/S3** for file storage, **Resend/SendGrid** for transactional email, hosted on **Vercel/Railway**, DB on **Supabase/PlanetScale**. Every fix below is placed in that stack, not in WordPress — the plugin will not be patched for any of these.

Two backend primitives are referenced by several fixes, so define them once:

- **`rate_limit_events` / limiter** — a shared rate-limit facility. On Vercel/Railway serverless, an in-process counter is not durable across instances, so back it with **Postgres rows** (or Redis/Upstash if added). Keyed by `(bucket, key)` with a sliding or fixed window. Used by I-6 and I-9.
- **`request_context` middleware** — resolves the real client IP (behind Vercel/Railway proxy, read the leftmost trusted `X-Forwarded-For`) and the authenticated `user_id` from the access token. Used everywhere.

Current WordPress data model that maps forward: a "draft" is a post with `umgpc_status` meta (`draft` → `submitted`), per-user auth code lives in `umgpc_auth_code` / `umgpc_auth_code_expiry` user meta, payment in `umgpc_payment_status`, and student proofs are Media Library attachments referenced by `umgpc_student_proof_id`. In Postgres these become `entries`, `auth_codes`, `users`, and `entry_documents` tables.

---

## I-4 — Server-side submission validation

### (a) Risk / failure scenario
Today `/umg/v1/submit` (`docs/plugin/umg-photo-contest/includes/submission.php:26-44`) only checks that a draft exists and is not already submitted, then flips `umgpc_status` to `submitted`. It never re-checks required fields, photo count, division bounds, or the four legal consent attestations (`consent_originality`, `consent_subjects`, `consent_rights`, `consent_rules`). All of that lives client-side only, in `canSubmit` (`SubmissionForm.tsx:468-475`). A crafted `POST /submit` (or a frontend regression) can finalize an **empty or partial entry with none of the legal consents attested** — i.e. an entry enters judging without the originality/subject-consent/rights attestations the rules require, and with no server record that they were ever agreed to.

### (b) Why safe to defer
The real UI disables the submit button until `personalInfoValid && hasRequiredPhotos && photosValid && biographyValid && studentProofValid && allConsentsChecked`. An honest user physically cannot submit an invalid entry through the app, so the happy path is unaffected. The exposure is only crafted requests / future frontend bugs.

### (c) Recommended design (custom backend)
- **Validate on the server at submit time**, using the same competition config that drives the UI (`lib/competitions/current.ts` becomes the backend's single source of division rules — `ageMin/ageMax`, `maxPhotos`, `maxDescriptionWords`, `biographyRequired`). One schema module, imported by both the API and the Next.js form, so the rules cannot drift.
- Implement `POST /api/entries/:id/submit` as a transaction that re-derives validity from persisted state, not from the request body:
  - draft belongs to the caller and is in `draft` status;
  - a division is set and the entrant's DOB falls within that division's `ageMin/ageMax`;
  - photo count is within `1..maxPhotos`, every photo row is fully uploaded (has a storage key, not mid-upload), each description ≤ `maxDescriptionWords`;
  - biography present when the division requires it;
  - a student-proof document exists (see I-7);
  - all four required consents are recorded true.
- Use a schema validator (**Zod**) for shape/type, plus the business-rule checks above. Return `422` with a machine-readable list of failed rules so the form can highlight fields.
- **Persist a consent record**, not just a boolean. Write an immutable `entry_consents` row at submit: `entry_id`, each consent flag, the `consent_statement_version` (hash/version of the exact `originalityStatement` / `consentStatement` text shown), `agreed_at`, `ip`, `user_agent`. This gives a defensible legal audit trail (minors' rights/subject consent) that the current meta booleans do not.
- Keep the existing immutability guarantee: once `status = submitted`, submit is idempotent/rejected (mirror the current `already_submitted` 400).

### (d) Acceptance criteria
- `POST submit` with a valid, complete draft → `200`, status `submitted`, `entry_consents` row written with statement version.
- `POST submit` with any single missing consent, zero photos, `maxPhotos+1` photos, DOB outside the division, or missing student proof → `422`, status stays `draft`, no consent row written.
- Direct API call bypassing the UI cannot produce a `submitted` entry lacking any of the four consents (integration test hitting the API directly, not through the form).
- Second submit on an already-submitted entry → rejected, no duplicate consent row.

### (e) Effort / priority
**Priority: High** (data integrity + legal). **Effort: M** — shared schema module + one transactional endpoint + one table.

---

## I-6 — Brute-forceable auth code → account takeover

### (a) Risk / failure scenario
`verify-code` (`auth.php:118-147`) compares a **6-digit** numeric code (`~10^6` space) within a 15-minute window with **no rate limiting, no attempt lockout, and no rotation on a wrong guess** — the stored code is only cleared on success or expiry. An attacker who knows a target email can script guesses and exhaust the space well within 15 minutes, then log in as that user. Because auth gates submissions, PII (student proofs), and payment status, this is the most serious security item in the audit.

### (b) Why safe to defer
Honest users receive the code by email and enter it once — throttling and longer codes are invisible to them. No functional impact; purely closes the online-guessing window. (Audit flags it as "must be designed in from day one" on the new backend.)

### (c) Recommended design (custom backend)
- **Longer, higher-entropy code.** Move from 6 numeric digits to an **8-character Crockford-base32** code (case-insensitive, no ambiguous chars) ≈ 40 bits, or an 8-digit numeric if UX demands digits only. Store only a **hash** of the code (`sha256`/argon2) in `auth_codes`, never the plaintext — parity with how passwords are stored, so a DB read doesn't leak live codes. Compare with a constant-time equal.
- **Per-attempt lockout table.** `auth_codes` row carries `attempts_remaining` (start at 5) and `expires_at` (keep the 15-min TTL). Each wrong guess **decrements and rotates/deletes** the code at 0 — so a wrong guess actively shrinks the attacker's window instead of leaving the same code live. A correct guess deletes the row (single-use, already done today).
- **Rate-limit middleware** on both `request-code` and `verify-code`, keyed by **email AND client IP** via the shared limiter: e.g. ≤ 5 verify attempts per code, ≤ 10 verify attempts / 15 min / IP, and the I-9 caps on `request-code`. Return `429` with `Retry-After` once tripped.
- **No oracle on failure.** `verify-code` returns the same generic "invalid or expired code" for wrong code, expired code, exhausted attempts, and unknown email (ties into I-9's non-enumeration).

### (d) Acceptance criteria
- After 5 wrong codes for one issued code, the 6th attempt is rejected **and** the code is invalidated (a subsequent correct guess fails; user must request a new code).
- Codes are ≥ 8 chars / ≥ ~40 bits; DB stores only a hash (verified by inspecting the row).
- Automated 100-guess loop against one email inside the window never succeeds and trips `429`.
- Correct code on the first try still logs in (happy path regression test).

### (e) Effort / priority
**Priority: Critical** (account takeover). **Effort: M** — `auth_codes` table with attempt counter + hashing + limiter wiring.

---

## I-7 — Minors' student-proof PII at public, enumerable URLs

### (a) Risk / failure scenario
`umgpc_upload_student_proof` (`draft.php:452-539`) pushes the proof (student ID or transcript — **PII of minors**, youth division starts at age 10) into the **WP Media Library** via `wp_handle_upload` + `wp_insert_attachment`, then returns `wp_get_attachment_url()`. That URL is served straight off the webserver with **no access control**, lives under a guessable `/wp-content/uploads/YYYY/MM/` path, and the numeric attachment ID is enumerable. Anyone with (or guessing) the URL reads a minor's ID/transcript. `wp_generate_attachment_metadata` also generates derivative thumbnails at equally public paths.

### (b) Why safe to defer
Upload/replace/delete and the submit gate (`studentProofValid`) all keep working; there is no functional break. This is a confidentiality exposure only, so it can move with the storage migration.

### (c) Recommended design (custom backend)
- **Private object storage, never a public bucket.** Store proofs in a dedicated **private S3 bucket / Cloudinary "authenticated" resource** with a **non-enumerable key** (`entry-documents/{uuid}`), `public-read` disabled, block-public-access on. DB `entry_documents` row holds `entry_id`, `storage_key`, `content_type`, `original_filename`, `uploaded_at` — the file URL is **never** stored or returned as a durable link.
- **Serve only via short-lived signed URLs** minted on demand: `GET /api/entries/:id/document` checks the caller is the owner **or** a judge/admin role, then returns a presigned URL (S3 presign / Cloudinary signed, TTL ~60–300s). No signed URL is issued to anyone else; expired links stop working.
- **Do not generate public derivatives.** Skip thumbnailing of proofs (they are documents, not gallery images); if a preview is needed, generate it into the same private space.
- **Least-necessary retention.** These are eligibility proofs — add a retention job to purge `entry_documents` for non-winning / closed competitions after the appeal window, since we hold minors' PII. (Contest photos, which are meant to be public, stay in the normal public image bucket — keep the two storage classes separate.)
- Preserve current behavior: single proof per entry, replace deletes the prior object, MIME sniffing (`finfo` equivalent — verify magic bytes server-side, don't trust the client type), 10 MB cap.

### (d) Acceptance criteria
- Direct request to a proof's storage URL without a valid signature → `403` (bucket has no public read).
- Owner and judge/admin can fetch a working signed URL; a second, unauthenticated user cannot; the signed URL 403s after its TTL.
- Storage keys are UUID-based and not sequential/enumerable.
- Replacing a proof removes the previous object from storage (no orphaned readable file).
- MIME is validated by content sniffing, not the request-declared type; > 10 MB rejected.

### (e) Effort / priority
**Priority: High** (minors' PII, likely compliance-relevant). **Effort: M** — private bucket config + signed-URL endpoint + `entry_documents` table + retention job.

---

## I-9 — `request-code` account spam / mailbombing / user enumeration

### (a) Risk / failure scenario
`umgpc_request_code` (`auth.php:60-111`) will, for **any** submitted email: create a WP `subscriber` user if none exists (`wp_insert_user`) and fire `wp_mail`, **unthrottled**. So an attacker can (1) mass-create junk accounts, bloating the user table, and (2) use our server to **mailbomb arbitrary third-party addresses**, burning the domain's sending reputation. It also **enumerates users**: `verify-code` returns a distinct `user_not_found` (404) for unknown emails vs. `invalid_code` (401) for known ones, revealing who has an account.

### (b) Why safe to defer
A legitimate user requests a code a handful of times; caps set well above normal use are invisible. No happy-path impact; this is abuse-surface reduction.

### (c) Recommended design (custom backend)
- **Throttle `request-code`** via the shared limiter, keyed by **email and IP**: e.g. ≤ 3 codes / email / 15 min, ≤ 10 / IP / hour, plus a global hourly cap as a circuit breaker. Over the limit → `429` `Retry-After`. This is the single most important control — it caps both account creation and outbound mail.
- **Uniform, non-committal response.** Always return the same `200 {"ok": true}` "if that email is valid, a code is on the way" regardless of whether the account existed — no oracle for enumeration. Pair with I-6's uniform `verify-code` error so neither endpoint distinguishes known vs unknown emails.
- **Don't create a real account on request.** Decouple "someone typed an email" from "a user exists": issue codes against a lightweight `auth_codes` row keyed by email; only **materialize a `users` row on successful verification** (or when they actually start a draft/pay). This alone removes the mass-account-creation primitive — unverified emails never become durable users.
- **Provider-side protections for email:** send through Resend/SendGrid with SPF/DKIM/DMARC configured, and rely on the request-code throttle to keep volume under the provider's abuse thresholds so reputation isn't burned.
- Optional escalation if abuse appears: CAPTCHA / proof-of-work challenge on `request-code` after N misses from an IP.

### (d) Acceptance criteria
- 4th code request for one email within 15 min → `429`; likewise IP cap.
- `request-code` for a never-seen email and for an existing user return **byte-identical** bodies/status.
- No `users` row is created by `request-code` alone; a row appears only after a code is successfully verified.
- Load test cannot drive unbounded `wp_mail`-equivalent sends (volume is capped by the limiter).

### (e) Effort / priority
**Priority: High** (reputation + abuse). **Effort: S–M** — limiter wiring + deferred user creation + response-shape change; reuses I-6's `auth_codes` and limiter.

---

## I-10 — Unnecessary CORS credentials + localStorage token exposure

### (a) Risk / failure scenario
`cors.php:25,46` sends `Access-Control-Allow-Credentials: true` on both preflight and responses, even though auth is a **Bearer token, not cookies** — so the credentialed-CORS surface is unnecessary. Separately, `AuthContext.tsx:19,43,80` stores a **7-day JWT in `localStorage`** (`umgpc_token`), which is readable by any JavaScript, so **any XSS on the site yields full token theft** and a week-long valid session.

### (b) Why safe to defer
The origin allowlist (`umgpc_allowed_origins`) plus Bearer auth means it's not exploitable on the happy path without a separate XSS bug; the audit rates it low. Login/session works fine as-is.

### (c) Recommended design (custom backend)
- **Drop credentialed CORS.** With token auth, respond `Access-Control-Allow-Origin: <allowlisted origin>` and **omit `Access-Control-Allow-Credentials`** entirely (only needed for cookie/withCredentials flows). Keep the strict origin allowlist and `Vary: Origin`.
- **Split the token into short-lived access + refresh:**
  - **Access token**: JWT, TTL ~15 min, sent as `Authorization: Bearer`. Kept **in memory** (React state/context), not `localStorage` — an XSS can't read a page-lifetime-only value from storage, and a stolen access token expires in minutes.
  - **Refresh token**: opaque, long-lived (e.g. 7 days), set as an **`HttpOnly; Secure; SameSite=Lax` cookie** scoped to the API domain — unreadable by JS, so XSS can't exfiltrate it. `POST /api/auth/refresh` reads the cookie, rotates the refresh token (rotation + reuse-detection revokes the family on replay), and returns a fresh access token. Note this reintroduces cookies for the refresh route only, so **that route** needs `credentials` + CSRF defense (SameSite=Lax covers top-level; add a CSRF token or origin check for the refresh POST).
  - Persist refresh tokens server-side in a `sessions` table so `logout` and reuse-detection can **revoke** them (the current stateless 7-day JWT cannot be revoked at all).
- **Frontend change:** `AuthContext` stops writing `umgpc_token` to `localStorage`; on load / on 401 it calls `/refresh` (cookie-based) to rehydrate the in-memory access token. `logout` calls a server endpoint that clears the cookie and revokes the session.
- Keep what already works: HS256 with header-`alg` ignored, `hash_equals`/constant-time compare — carry these forward to the new signer.

### (d) Acceptance criteria
- Preflight and actual responses for the API contain no `Access-Control-Allow-Credentials` header (except, if used, the dedicated refresh route).
- No auth token is present in `localStorage`/`sessionStorage` after login (verify via devtools/Storage); access token exists only in memory and disappears on reload until `/refresh`.
- Refresh cookie is `HttpOnly` + `Secure` + `SameSite` (verify via response headers) and is not readable from `document.cookie`.
- `logout` / detected refresh-token reuse revokes the session server-side: subsequent `/refresh` with the old token → `401`.
- Access token TTL ≤ ~15 min; a captured access token stops working after expiry.

### (e) Effort / priority
**Priority: Medium** (defense-in-depth; needs an XSS to exploit). **Effort: M** — access/refresh split + `sessions` table + frontend auth rewrite; CORS change is trivial.

---

## Migration checklist

| Issue | Class | New-backend component | Priority | Done-when |
| --- | --- | --- | --- | --- |
| **I-6** | Security (ATO) | `auth_codes` table (hashed code, `attempts_remaining`, TTL) + rate-limit middleware; ≥8-char codes | **Critical** | 5 wrong guesses invalidate the code; 100-guess loop can't log in and trips `429`; correct first guess still works |
| **I-4** | Integrity/legal | Shared Zod+business-rule validator on `POST /entries/:id/submit` + immutable `entry_consents` record (statement version) | **High** | Direct API call can't finalize an entry missing any consent/photos/division; consent row written with version on valid submit |
| **I-7** | Privacy (minors' PII) | Private S3/Cloudinary bucket + `entry_documents` (UUID keys) + signed-URL fetch endpoint (owner/judge only) + retention purge | **High** | Unsigned proof URL → 403; owner/judge get TTL-limited signed URL; replace deletes old object |
| **I-9** | Abuse (spam/mailbomb/enum) | Rate limiter on `request-code` (email+IP caps) + uniform responses + defer user creation to verify | **High** | Caps return `429`; known vs unknown email responses identical; no user row created before verification |
| **I-10** | Security (XSS/session) | Drop `Allow-Credentials`; short-lived in-memory access JWT + HttpOnly rotating refresh cookie + `sessions` table; frontend `AuthContext` rewrite | **Medium** | No token in `localStorage`; refresh cookie is HttpOnly/Secure; logout/reuse revokes session; no `Allow-Credentials` header |

**Suggested build order:** shared limiter + `auth_codes` first (unblocks **I-6** and **I-9** together), then **I-4** validator + consents, then **I-7** private storage, then **I-10** token/session model. I-6, I-9, and I-10 all touch the auth layer, so land them in one auth-subsystem pass rather than piecemeal.
