# Judge / Admin Scoring Dashboard — Implementation Plan

> Intent: build the authenticated judge/admin dashboard where judges review submitted photo entries and record per-criterion scores, reusing the existing UMG JWT auth and `umg_submission` CPT. This is Flow 2 of the "Art Submission System" — the genuinely-unbuilt half. Needed before the **Sept 1 – Oct 15, 2026 Jury Review** window (`apps/umg/lib/competitions/current.ts` timeline).

---

## 1. Overview & Scope

**What exists today (verified):**
- Passwordless email-code JWT auth: `docs/plugin/umg-photo-contest/includes/auth.php` (`request-code` / `verify-code` / `me`), `includes/jwt.php` (`umgpc_generate_jwt`, `umgpc_validate_jwt`, `umgpc_get_user_from_request`). All accounts get the WP `subscriber` role (`auth.php` ~line 83). JWT payload holds **only** `user_id`, `email`, `exp` — no role claim.
- Submission data lives in the `umg_submission` CPT: `includes/post-types.php` (`show_ui => true`, **`show_in_rest => false`** — reviewed only via wp-admin today). Meta model in `includes/draft.php`: `umgpc_user_id`, `umgpc_status` (`draft` | `submitted`), `umgpc_division`, `umgpc_first_name`/`last_name`/`dob`/`address`/`school`/`grade`/`job`/`biography`, `umgpc_photo_{1..3}_id`/`_title`/`_description`, `umgpc_student_proof_id`, `umgpc_consent_*`, `umgpc_social_links`, `umgpc_submitted_at`. Finalize flips status in `includes/submission.php`.
- Judging rubric already authored in config: `currentCompetition.evaluationCriteria` (6 criteria) + `divisionJudgingNotes` in `apps/umg/lib/competitions/current.ts`.
- Frontend auth client + context: `apps/umg/lib/auth/api.ts`, `AuthContext.tsx`, `types.ts`. Token in `localStorage` key `umgpc_token`.
- `apps/umg/app/judges-panel/page.tsx` is a **public "Meet the Judges" bio page** — not a review tool.
- Next.js UMG uses **`output: "export"`** (`apps/umg/next.config.ts`) — static export, `trailingSlash: true`. Protected pages must be client-side shells; all sensitive data comes from authenticated REST at runtime.

**In scope:** judge role + capability in WP; REST endpoints to list submitted entries, read/write this judge's scores, and (admin) aggregate results; a per-judge `umgpc_score` data model; `/admin` protected routes (auth + role guard, submissions list, per-entry scoring UI, results view).

**Out of scope:** changing the public submitter flow (done, leave it); donations; the EM/IS editor; social auto-post.

---

## 2. Key Decisions To Make Up Front

### D1 — Judge role model
Register a WordPress **custom role `umgpc_judge`** and a dedicated **capability `umgpc_judge_submissions`**, plus treat WP `administrator` (or an `umgpc_admin` cap) as the super-role that can also see aggregated results and set final statuses. Judges are **pre-provisioned** (created/promoted by an admin), not self-serve. New file `includes/roles.php`, registered on plugin activation.
- Rationale: keeps authorization in WP where users live; a capability (not a role-name string) lets admins also judge without role juggling.

### D2 — How judges authenticate (extend passwordless vs. WP admin login)
**Extend the existing passwordless email-code flow.** Judges log in with the same `request-code` / `verify-code` endpoints they already work; authorization is decided by **capability at request time**, not at login. Do **not** add a username/password path and do **not** install the JWT Authentication plugin.
- The JWT payload stays unchanged (`user_id`, `email`, `exp`), so it carries no role — **look the role up server-side** on every protected request (`get_userdata($user_id)->allcaps`). This keeps the token contract stable and makes role changes take effect immediately (revocable without token rotation).
- Extend `GET /umg/v1/me` to return `roles` / `is_judge` / `is_admin` booleans so the frontend guard can branch without a second call.
- Guard rail: since `request-code` auto-creates a `subscriber` for any email, being able to log in ≠ being a judge. Every admin endpoint must assert the capability. Optionally restrict who can even *reach* the admin login UI, but the real gate is server-side.

### D3 — Scoring rubric source & scale
**Reuse `currentCompetition.evaluationCriteria`** from `current.ts` as the single source of truth for *what* is scored; the frontend renders one input per criterion. The **plugin stays criteria-agnostic** — it stores an array of `{ key, score }` plus notes, validating only the numeric range. This means changing the rubric in config never requires a plugin edit.
- **Scale decision (pick one, document it):** recommend **1–10 integer per criterion**, 6 criteria → max 60, plus an optional overall `notes` textarea. Store a stable `key` per criterion = slug of the criterion name (e.g. `relevance-to-the-theme`) so scores survive reordering. Add a `criteriaVersion` string on save to detect rubric drift.
- Surface `divisionJudgingNotes[division]` as read-only guidance next to the form.

### D4 — Score data model (`umgpc_score`)
**Per-judge, stored as post meta on the submission**, keyed by judge user id: meta key `umgpc_score_{judgeId}` holding JSON:
```json
{
  "judge_id": 42,
  "scores": { "relevance-to-the-theme": 8, "technical-execution": 6, ... },
  "total": 41,
  "notes": "…",
  "criteria_version": "2026-youth-photography",
  "status": "draft" | "final",
  "updated_at": "2026-09-05 14:03:00"
}
```
- Rationale: mirrors the existing `umgpc_*` post-meta pattern; multiple judges are naturally independent and auditable; no schema migration. A helper enumerates `umgpc_score_*` meta for aggregation.
- **Alternative considered:** a dedicated `umgpc_score` CPT (one post per judge×submission). Cleaner for heavy querying/audit logs and maps 1:1 onto a future SQL `scores` table, but heavier. **Recommendation: post-meta now**; note the CPT option in the migration section. Either way the REST contract is identical, so the choice is invisible to the frontend.

### D5 — Blind judging & PII
Entries contain PII (name, DOB, address, school). Default the judge-facing views to **blind**: expose only division, photos, photo titles/descriptions, biography, and the entry's opaque id — **not** name/dob/address/school/student-proof. Add a plugin flag `umgpc_blind_judging` (default `true`); admins get the identified view. Decision to confirm with the client, but build blind-by-default.

### D6 — Locking
Only entries with `umgpc_status === 'submitted'` are judgeable; drafts never appear. Scores may be edited while `status: draft`; once a judge marks `final` (or after the jury deadline), lock further edits for that judge.

---

## 3. Backend — WP Plugin Steps

All paths under `docs/plugin/umg-photo-contest/`.

**Step B1 — Register judge role + capability.**
New `includes/roles.php`:
- `umgpc_register_roles()` → `add_role('umgpc_judge', 'Contest Judge', ['read' => true, 'umgpc_judge_submissions' => true])`; grant `umgpc_judge_submissions` (and a `umgpc_admin_results` cap) to `administrator`.
- Call it from the `register_activation_hook` in `umg-photo-contest.php` (next to `umgpc_register_post_types()`), and add `require_once UMGPC_PATH . 'includes/roles.php';` to the includes list.
- Provide an admin-only utility to promote an existing user to judge (a small wp-admin action, or WP-CLI note) since there is no self-serve path.

**Step B2 — Capability helper.**
Add to `includes/jwt.php` (alongside `umgpc_get_user_from_request`) or in `roles.php`:
- `umgpc_user_can(int $user_id, string $cap): bool` → `user_can($user_id, $cap)`.
- `umgpc_require_cap(WP_REST_Request $req, string $cap)` → returns validated `user_id` or `WP_Error(403)`. Reuses `umgpc_get_user_from_request` first (401 if no/invalid token), then checks the cap (403 if authenticated but unauthorized). Use this as the `callback` guard, keeping `permission_callback => '__return_true'` to match the existing pattern (token parsed inside the callback).

**Step B3 — Extend `/me` with roles.**
In `includes/auth.php` `umgpc_me()` (and the `verify-code` user payload), add `is_judge` / `is_admin` booleans (via `user_can`). Update `apps/umg/lib/auth/types.ts` `User` to include them.

**Step B4 — New judging endpoints.**
New `includes/judging.php` (registered in `umg-photo-contest.php`), namespace `umg/v1`, each callback guarded by `umgpc_require_cap(..., 'umgpc_judge_submissions')`:

- `GET /umg/v1/admin/submissions` — list `umgpc_status = submitted` entries. Query params: `division`, `status` (review status), pagination. Returns a **summary per entry** (opaque id, division, photo thumbnail URLs, submitted_at, this judge's score status `unscored|draft|final`). Blind by default (no PII). Reuse `WP_Query` over `umg_submission` with a `meta_query` on `umgpc_status`.
- `GET /umg/v1/admin/submissions/{id}` — single entry detail: photos (full Media Library URLs from `umgpc_photo_*`), titles/descriptions, biography, division, `divisionJudgingNotes` context, **and this judge's existing score only** (read `umgpc_score_{callerId}`). Never return other judges' scores here.
- `PUT /umg/v1/admin/submissions/{id}/score` — upsert the caller's score. Body: `{ scores: {key:number}, notes, status }`. Validate: entry exists and is `submitted`; each score is an int within the agreed range; caller's score not already `final` (unless admin override). Write `umgpc_score_{callerId}` JSON, recompute `total`, stamp `updated_at` + `criteria_version`. Return the saved score.
- `GET /umg/v1/admin/results` — **admin-only** (`umgpc_require_cap(..., 'umgpc_admin_results')`). Aggregates all `umgpc_score_*` meta per entry: per-criterion average, mean total, judge count, ranking within division. This is the only endpoint that reveals cross-judge data — gate it hard, and optionally also gate it behind "after the jury deadline".
- (Optional) `POST /umg/v1/admin/submissions/{id}/status` — admin sets review status `reviewed` | `winner` | `rejected` on `umgpc_review_status` meta (the doc's status set), distinct from the submitter-facing `umgpc_status`.

**Step B5 — Register score/status meta (optional but recommended).**
Register `umgpc_review_status` (and the per-judge score meta family, if you keep meta) so they are documented; keep `show_in_rest => false` on `umg_submission` — the custom `/admin/*` endpoints are the only exposure, so raw meta never leaks through core REST.

**Step B6 — CORS.**
No change needed — `includes/cors.php` / `umgpc_allowed_origins()` already allows `localhost:3000` and the prod origins; the new routes inherit it.

---

## 4. Frontend — Next.js Steps

All paths under `apps/umg/`. Remember `output: "export"`: everything below is client-rendered; pages are empty shells at build, data loads at runtime behind the JWT.

**Step F1 — Judging API client + types.**
- `lib/judging/types.ts` — `SubmissionSummary`, `SubmissionDetail`, `JudgeScore` (`{ scores: Record<string, number>; notes; status }`), `ResultsRow`.
- `lib/judging/api.ts` — `listSubmissions(token, filters)`, `getSubmission(token, id)`, `saveScore(token, id, payload)`, `getResults(token)`. Reuse the exact patterns in `lib/auth/api.ts` (`API_BASE`, `authHeaders`, `handleResponse`, `CompetitionApiError`).
- Extend `lib/auth/types.ts` `User` with `is_judge`/`is_admin`; the existing `fetchCurrentUser`/`refreshUser` path picks them up for free.

**Step F2 — Route group + auth/role guard.**
- `app/admin/layout.tsx` — wrap children in `AuthProvider` (as `photo-submission` already does) and render an `AdminGuard`.
- `app/admin/AdminGuard.tsx` (client) — uses `useAuth()`: while `isLoading` show spinner; if no `user` render the login surface; if `user && !user.is_judge` render a "not authorized" panel (do **not** silently redirect — makes debugging easier); else render children.
- `app/admin/login/page.tsx` — reuse the existing `app/photo-submission/components/AuthForm.tsx` (or extract it to `lib/auth/` / a shared component) so judges use the same email-code UI.

**Step F3 — Submissions list.**
- `app/admin/page.tsx` (or `app/admin/submissions/page.tsx`) — client component; on mount calls `listSubmissions(token)`. Renders a filterable table (division, my-score status) of blind entry cards with thumbnails. Each row links to the scoring view.

**Step F4 — Per-entry scoring UI (static-export gotcha).**
`output: "export"` cannot pre-render a dynamic `[id]` segment for entry ids unknown at build time. **Use a query-param route, not a dynamic segment:** `app/admin/entry/page.tsx` reads `?id=` via `useSearchParams()` and calls `getSubmission(token, id)`. (If a `[id]` segment is preferred later, it would need `generateStaticParams` returning known ids — not viable for live entries, so avoid.)
- Renders the photos + descriptions + biography + division notes, and a form with **one control per `currentCompetition.evaluationCriteria` entry** (imported directly from config) on the agreed 1–10 scale, plus a notes textarea. Shows the running total. Save → `saveScore`; "Submit final" sets `status: final` and locks. Only ever shows the caller's own score.

**Step F5 — Results / aggregation view.**
- `app/admin/results/page.tsx` — admin-only (guard on `user.is_admin`); calls `getResults(token)`; renders per-division ranking table with per-criterion averages, mean totals, and judge counts. Handles the 403 from a non-admin gracefully.

**Step F6 — Nav.**
Add an inconspicuous entry point (footer or a `/admin` bookmark). Do not surface admin links in the public header.

---

## 5. Auth / Authorization Notes

- **Judges must not see other judges' scores prematurely.** List and detail endpoints return **only the caller's** score (`umgpc_score_{callerId}`). Cross-judge aggregation lives *only* in `GET /admin/results`, gated on the admin cap and (optionally) the jury-deadline date. No endpoint returns another judge's raw score to a judge.
- **Entries are PII.** Blind-by-default (D5): judge views omit name/dob/address/school/student-proof; only admins get the identified view. Never widen `umg_submission` to core REST (`show_in_rest` stays `false`); all access flows through capability-guarded custom routes.
- **Authenticated ≠ authorized.** `request-code` creates a `subscriber` for any email, so every `/admin/*` callback must assert `umgpc_judge_submissions`; the frontend guard is UX only, not a security boundary.
- **Locking.** Only `submitted` entries are exposed; the score endpoint re-checks status and `final` state server-side.
- **Token storage.** Tokens live in `localStorage` (XSS-exposable). Acceptable for submitters; for privileged judge/admin accounts consider a **shorter JWT expiry** for judges and/or moving to an httpOnly cookie. Note but don't block v1 — flag it as a hardening follow-up.
- **CORS** already restricts origins; no auth data is served cross-origin outside the allowlist.

---

## 6. Testing Approach

- **PHP / endpoint (curl or Postman):**
  - Authorization matrix: no token → 401; `subscriber` token → 403 on every `/admin/*`; judge token → 200 on list/detail/score, 403 on `/admin/results`; admin token → 200 everywhere.
  - Blind view: judge detail response contains **no** PII keys.
  - Isolation: two judges score the same entry; each `GET detail` returns only their own score; `/admin/results` shows both aggregated correctly (averages/totals math).
  - Validation: out-of-range score rejected; scoring a `draft` entry rejected; editing a `final` score rejected.
  - Locking: draft never listed; submitted entry immutable to the submitter (existing behavior, regression-check).
- **Frontend (manual, static-export build):** seed 2–3 `submitted` entries in wp-admin; verify guard states (loading / login / not-authorized / authorized), list → entry → save → reload persistence, admin-only results 403 handling for a judge, and that rubric matches `current.ts` after a config edit (no plugin change needed).
- Add a short seed/QA note to `docs/plugin/umg-photo-contest/` for promoting a test judge.

---

## 7. Effort Estimate

| Area | Work | Estimate |
|------|------|----------|
| Backend | `roles.php`, cap helper, `/me` extension, `judging.php` (4–5 endpoints), meta registration | **~2–3 days** (M) |
| Frontend | judging api/types, admin layout + guard, list, scoring UI, results view | **~3–4 days** (M) |
| Testing / QA / seed docs | authorization matrix, blind view, aggregation, manual pass | **~1 day** |
| **Total** | | **~1–1.5 weeks** (M) |

Comfortably ahead of the **Sept 1, 2026** jury start given today's date.

---

## 8. Build in WP Now vs. Wait for the Custom Backend

**Build in WP now.** The jury review runs Sept–Oct 2026, well before any realistic WordPress→custom-backend migration, and the pieces this depends on (JWT auth, `umg_submission` CPT, Media Library photos, CORS) are already live and stable. `custom-backend-plan.md` lists "judging panel — auth with judge roles, scoring, audit logs" as a *migration-enabled* feature, but there is no reason to block the 2026 contest on it.

Keep the port cheap by holding the **data contract clean**: the frontend talks to a `Bearer`-token REST surface with a **criteria-agnostic score object** (`{key, score}[]` + notes), so when the backend moves to SQL, `umgpc_score_{judgeId}` meta maps directly onto a `scores(submission_id, judge_id, criterion_key, score)` table and the React code barely changes. If cross-judge querying/audit becomes heavy before then, promote the score model from post-meta (D4) to a dedicated `umgpc_score` CPT — an internal change invisible to the frontend.
