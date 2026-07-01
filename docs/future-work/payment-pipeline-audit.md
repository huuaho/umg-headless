# Payment Pipeline Audit

Full audit of the photo-competition **auth + payment pipeline**, spanning the
WordPress plugin (`docs/plugin/umg-photo-contest/`) and the Next.js frontend
(`apps/umg/`). Recorded 2026-06-30.

## Context & decisions

- The team plans to **migrate off WordPress plugins to a custom backend**.
  Therefore the priority is **functional correctness** (does the happy path work
  for honest users?). Pure security/privacy hardening is intentionally deferred
  to the custom backend unless it also causes a functional failure.
- **Business rule confirmed: one entry per person.** A user enters a single
  division and pays a single $50 fee. The account-level paid flag and
  single-draft-per-user model are therefore **correct by design** — see [I-8].
- An async-payment webhook fix has **already been applied** (see [I-0]); this doc
  records the remaining items.

### Status legend

| Tag | Meaning |
| --- | --- |
| ✅ DONE | Already fixed in the plugin. |
| 🔧 FIXING NOW | Being implemented in the plugin this pass. |
| 🚀 OPS | Requires a Stripe Dashboard / deploy action, not code. |
| ⏭️ DEFER → custom backend | Real issue, intentionally postponed. |

---

## Functional issues (break the happy path for honest users)

### [I-0] Async payment methods (Alipay) never settled — ✅ DONE
**Where:** `docs/plugin/umg-photo-contest/includes/payment.php`
**Problem:** The webhook only acted on `checkout.session.completed`, which is the
synchronous "captured" signal for cards. Asynchronous methods like **Alipay**
complete first as `processing` (`payment_status: "unpaid"`) and settle later via
`checkout.session.async_payment_succeeded` — an event the handler discarded. The
user was never marked paid → stuck on "processing" forever. The old code also
marked users paid on `completed` **without checking `payment_status`**, which
could grant access on a still-processing session.
**Fix applied:** Handle `checkout.session.async_payment_succeeded`, and gate the
`completed` path on `payment_status === 'paid'`. `async_payment_failed` and
completed-but-processing sessions are acknowledged without granting.
**Still required to go live:** see [I-1] (OPS).

### [I-1] Async fix requires Stripe Dashboard + deploy — 🚀 OPS
**Action (not code):**
1. Stripe Dashboard → Developers → Webhooks → the endpoint → subscribe to
   `checkout.session.async_payment_succeeded` **and**
   `checkout.session.async_payment_failed` (in addition to
   `checkout.session.completed`). If not subscribed, Stripe never sends them.
2. Deploy the updated plugin.
3. To recover users already stuck: Developers → Events → the relevant
   `async_payment_succeeded` event → **Resend**.

### [I-2] Payment lost when payer's email ≠ login email — 🔧 FIXING NOW
**Where:** `payment.php` (webhook matches on `customer_email`) +
`apps/umg/app/photo-submission/components/SubmissionForm.tsx` (builds the Stripe
URL).
**Problem:** The webhook identifies the user purely by the email on the Stripe
session. The payment link only *prefills* the email; the customer can edit it,
and wallet flows (Link, Apple/Google Pay, PayPal) frequently settle under a
**different** email. When that happens the webhook finds no user, returns
`received: true`, and the payment is **silently lost** — money in, no entry
credited. This produces the **same "stuck on processing" symptom** as [I-0], so
some current reports may already be email mismatches that the async fix alone
will **not** resolve.
**Fix:** Pass `?client_reference_id=<wp_user_id>` on the Stripe payment link and
match the webhook on `client_reference_id` first, falling back to email so
nothing regresses. See also [I-5] (log the fallback misses).

### [I-3] "Check payment" button reads stale state — 🔧 FIXING NOW
**Where:** `SubmissionForm.tsx:503-521` (`handleCheckPayment`).
**Problem:** Calls `await refreshUser()` then, inside a `setTimeout`, reads
`authUser?.payment_status` — a value captured from the render closure, so it
always sees the pre-refresh value. The manual "I've completed payment – check
status" button therefore reports "Payment not yet detected" even on success. The
15s auto-poll masks it eventually, but the button is functionally dead.
**Fix:** Have `refreshUser()` return the fresh user and branch on the returned
value rather than the closed-over `authUser`.

### [I-11] Webhook acts on *every* checkout on the Stripe account — 🔧 FIXING NOW (with I-2)
**Where:** `docs/plugin/umg-photo-contest/includes/payment.php`.
**Problem:** The webhook has no notion of *what* was paid for. It marks the
matching user `paid` on any settled `checkout.session` on the account. Today only
entry fees exist, so it's latent — but the moment a **second** Payment Link is
added (see the planned [donations feature](remediation/../features/donations.md)),
any donor who uses an entrant's email gets wrongly flagged as a paid contest
entrant. Surfaced by the donations planning agent.
**Fix:** Set `purpose: entry_fee` metadata on the entry-fee link and gate the
webhook to act only on sessions with that purpose. Bundle with [I-2] since both
touch the same matching logic.

### [I-5] Unmatched webhook payments leave no trace — 🔧 FIXING NOW
**Where:** `payment.php` (the `get_user_by('email', …)` miss path).
**Problem:** When no user matches, the webhook returns `received: true` with no
logging. A payment lost to [I-2] is invisible — no way to reconcile.
**Fix:** `error_log` the event id, type, email, and amount on the no-match path.
Kept in the "fix now" set because it is functional support (visibility into lost
money), not hardening.

---

## Business-logic note

### [I-8] Account-level paid flag vs. per-division fee — ✅ BY DESIGN
`umgpc_payment_status` is one flag per user and `umgpc_find_draft_id` returns a
single draft per user. With the confirmed **one-entry-per-person** rule this is
correct; no change needed. Recorded here so the constraint is explicit — if the
rule ever changes to allow multiple divisions/entries, both the paid flag and the
draft model would need to become per-entry.

---

## Deferred to the custom backend (real issues, not fixing in the plugin)

### [I-4] `/submit` performs no server-side validation — ⏭️ DEFER
**Where:** `docs/plugin/umg-photo-contest/includes/submission.php:26-44`.
**Problem:** Flips status to `submitted` without validating required fields, photo
count, division, or the **consent attestations** (originality, subject consent,
rights — legal attestations). All validation is client-side (`canSubmit` in
`SubmissionForm`). A crafted request can submit an empty entry and bypass the
consents.
**Why deferred:** Only bites if the frontend misbehaves or requests are crafted;
the happy path is fine. Re-implement as server-side validation in the custom
backend.

### [I-6] Auth code is brute-forceable → account takeover — ⏭️ DEFER
**Where:** `docs/plugin/umg-photo-contest/includes/auth.php:118-147`.
**Problem:** `verify-code` compares a **6-digit** code within a 15-minute window
with **no rate limiting, no attempt lockout, and no rotation on a wrong guess**.
An attacker who knows a target email can exhaust the ~1,000,000-code space well
inside the window and log in as that user. Auth gates submissions, PII, and
payment status, so this is the most serious *security* issue.
**Why deferred:** Not a functional blocker for honest users. **Must be designed
in from day one on the custom backend** (throttle per email+IP, lock after ~5
failures + delete the code, longer alphanumeric codes).

### [I-7] Student-proof PII (minors' IDs/transcripts) at public URLs — ⏭️ DEFER
**Where:** `docs/plugin/umg-photo-contest/includes/draft.php:452-539`.
**Problem:** Student-proof uploads go to the WP Media Library and are served
directly by the webserver with no access control. These can be student IDs or
transcripts — **PII of minors** (youth division starts at age 10). Media IDs are
enumerable. Anyone with the URL can read them.
**Why deferred:** Privacy, not functional. On the custom backend, store proofs in
a private bucket behind signed/authenticated URLs — never in a public uploads
dir.

### [I-9] `request-code` enables account spam / mailbombing / enumeration — ⏭️ DEFER
**Where:** `auth.php:60-111`.
**Problem:** Any email creates a WP subscriber and triggers `wp_mail`, unthrottled
→ attacker can mass-create accounts and use the server to mailbomb arbitrary
addresses (harming domain sending reputation). Also user-enumerable (distinct
responses for existing vs unknown emails).
**Why deferred:** Abuse/security, not functional. Add rate limiting and
non-revealing responses in the custom backend.

### [I-10] Unnecessary CORS credentials + localStorage token exposure — ⏭️ DEFER
**Where:** `docs/plugin/umg-photo-contest/includes/cors.php`;
`apps/umg/lib/auth/AuthContext.tsx` (token in `localStorage`).
**Problem:** `Access-Control-Allow-Credentials: true` is set though auth is a
Bearer token, not cookies (unnecessary surface). The 7-day JWT lives in
`localStorage`, so any XSS yields token theft.
**Why deferred:** Not exploitable on the happy path given the origin allowlist;
low priority. Revisit token storage/session model in the custom backend.

---

## What is already solid (no action)

- Webhook signature verification: HMAC + 5-minute replay window, and correctly
  does **not** reject late async settlements (they carry fresh delivery
  timestamps).
- JWT is **not** vulnerable to `alg`/`none` confusion — it always recomputes
  HMAC-SHA256 and ignores the header `alg`.
- `hash_equals` used for both JWT and webhook signature comparison.
- Upload MIME sniffing via `finfo` (not trusting the client-declared type).
- Submitted entries are immutable across every draft-mutation endpoint.
- State-changing endpoints use Bearer tokens (not cookies), so CSRF is N/A.

---

## Summary table

| ID | Issue | Class | Status |
| --- | --- | --- | --- |
| I-0 | Alipay/async never settled | Functional | ✅ DONE |
| I-1 | Dashboard subscribe + deploy | Ops | 🚀 OPS |
| I-2 | Email-mismatch lost payment | Functional | 🔧 FIXING NOW |
| I-3 | Stale "check payment" button | Functional | 🔧 FIXING NOW |
| I-5 | Unmatched payments not logged | Functional support | 🔧 FIXING NOW |
| I-11 | Webhook acts on every account checkout | Functional (latent) | 🔧 FIXING NOW |
| I-8 | Account-level paid flag | Business logic | ✅ BY DESIGN |
| I-4 | No server-side submit validation | Integrity | ⏭️ DEFER |
| I-6 | Auth code brute-forceable | Security | ⏭️ DEFER |
| I-7 | Student-proof PII public URLs | Privacy | ⏭️ DEFER |
| I-9 | Account spam / mailbomb / enum | Security | ⏭️ DEFER |
| I-10 | CORS creds + localStorage token | Security | ⏭️ DEFER |
