# apps/umg/lib/auth/api.ts

**Purpose:** Typed fetch client for the WP photo-contest plugin's REST API (`/wp-json/umg/v1/`).

## Responsibilities
Builds `API_BASE` from `NEXT_PUBLIC_WP_API_URL` (fallback `https://www.api.unitedmediadc.com/wp-json`) + `/umg/v1`, and wraps every endpoint in a small fetch function. Non-OK responses are converted to `CompetitionApiError` (carrying the WP error `code`, `message`, and HTTP `status`); authorized calls send `Authorization: Bearer <jwt>`.

## Key exports
- `CompetitionApiError` — Error subclass with `code: string`, `status: number`.
- Auth: `requestCode(email)`, `verifyCode(email, code) -> AuthResponse`, `fetchCurrentUser(token) -> User` (`GET /me`).
- Draft: `loadDraft(token) -> DraftData | null` (404 → null), `saveDraft(token, payload)` (`PUT /draft`), `uploadPhoto(token, file) -> {id, url}` (multipart `POST /draft/photo`), `removePhoto(token, mediaId)` (`DELETE /draft/photo/:id`).
- Student proof: `uploadStudentProof(token, file)`, `removeStudentProof(token)` (`POST`/`DELETE /draft/student-proof`).
- `submitEntry(token)` — `POST /submit`, finalizes the entry.

## Dependencies
- Internal: [types](types.ts.md)
- External: browser `fetch` / `FormData`

## Used by
[AuthContext.tsx](AuthContext.tsx.md) (auth endpoints) and [SubmissionForm](../../app/photo-submission/components/SubmissionForm.tsx.md) (draft/upload/submit endpoints).

## Notes
Server-side counterparts in the plugin docs: [auth.php](../../../../plugin/umg-photo-contest/includes/auth.php.md) (OTP request/verify, `/me`), [jwt.php](../../../../plugin/umg-photo-contest/includes/jwt.php.md) (token validation), [draft.php](../../../../plugin/umg-photo-contest/includes/draft.php.md) (draft CRUD + uploads), [submission.php](../../../../plugin/umg-photo-contest/includes/submission.php.md) (finalize), [cors.php](../../../../plugin/umg-photo-contest/includes/cors.php.md) (allows the static frontends). Network/IO module — no React; uploads do not report progress.

---
*Documented at commit 1cbdce5.*
