# apps/umg/lib/auth/types.ts

**Purpose:** TypeScript shapes for the competition auth + draft REST API (mirrors the WP plugin's JSON contracts).

## Responsibilities
Defines the request/response types exchanged with `/wp-json/umg/v1/`:

- `User` — `id`, `email`, `name`, `payment_status: "unpaid" | "paid"`.
- `AuthResponse` — `{ token, user }` returned by code verification.
- `DraftData` — full draft as returned by `GET /draft`: `status: "draft" | "submitted"`, division, personal info (snake_case: `first_name`, `dob`, `school`, `grade`, `job`, …), `biography`, `photos: DraftPhoto[]`, `student_proof: DraftStudentProof | null`, five consent booleans, `social_links`, `submitted_at`.
- `SaveDraftPayload` — what `PUT /draft` sends (like `DraftData` minus status/urls; photos carry only `media_id`, `title`, `description`).
- `DraftPhoto` / `DraftStudentProof` — uploaded media references (`media_id`, `url`, …).
- `UploadPhotoResponse` / `UploadStudentProofResponse` — `{ id, url(, filename) }` from the upload endpoints.

## Key exports
- `User`, `AuthResponse`, `DraftData`, `DraftPhoto`, `DraftStudentProof`, `SaveDraftPayload`, `UploadPhotoResponse`, `UploadStudentProofResponse` (all interfaces)

## Dependencies
- Internal: none
- External: none

## Used by
[api.ts](api.ts.md), [AuthContext.tsx](AuthContext.tsx.md), and (indirectly) [SubmissionForm](../../app/photo-submission/components/SubmissionForm.tsx.md).

## Notes
Field names are snake_case to match the WordPress plugin's JSON exactly — see [includes/draft.php](../../../../plugin/umg-photo-contest/includes/draft.php.md) and [includes/auth.php](../../../../plugin/umg-photo-contest/includes/auth.php.md). Changes must be coordinated with the plugin.

---
*Documented at commit 1cbdce5.*
