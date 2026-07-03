# docs/plugin/umg-photo-contest/includes/draft.php

**Purpose:** Draft CRUD REST endpoints — entry form fields, photo uploads (max 3), and student-proof document upload.

## Responsibilities
The largest file in the plugin. Manages the per-user `umg_submission` draft post: upserting text/consent fields, uploading photos and the student-proof document into the WP Media Library, and removing them. All endpoints require a bearer JWT and refuse modification once the entry status is `submitted`.

## REST routes (namespace `umg/v1`, all Bearer JWT)
| Method | Path | Callback |
|--------|------|----------|
| GET | `/draft` | `umgpc_get_draft` |
| PUT | `/draft` | `umgpc_save_draft` |
| POST | `/draft/photo` | `umgpc_upload_photo` |
| DELETE | `/draft/photo/(?P<id>\d+)` | `umgpc_remove_photo` |
| POST | `/draft/student-proof` | `umgpc_upload_student_proof` |
| DELETE | `/draft/student-proof` | `umgpc_remove_student_proof` |

## Key exports
- Helpers: `umgpc_find_draft_id($user_id) -> int` (WP_Query on `umgpc_user_id` meta, **excluding** posts with `umgpc_school_batch` meta — see Notes), `umgpc_create_draft($user_id) -> int|WP_Error`, `umgpc_build_photos_array($post_id) -> array` (slots 1–3 → `{media_id, url, title, description}`; reused by [school.php](school.php.md)), `umgpc_build_student_proof($post_id) -> array|null` (`{media_id, url, filename}`).
- `umgpc_get_draft` — returns the full draft: `status`, `division`, name/DOB/address/school/grade/job/biography, `photos`, `student_proof`, five consent booleans (`consent_originality/subjects/rights/rules/social_media`), `social_links`, `submitted_at`. 404 if no draft.
- `umgpc_save_draft` — upsert; creates the draft if missing; sanitizes and saves text fields, consent booleans, and photo titles/descriptions (matched by `media_id` to an existing slot — PUT never adds/removes photo files). Touches `post_modified` so cleanup sees activity. 400 `already_submitted` if finalized.
- `umgpc_upload_photo` — FormData field `photo`; JPEG only (finfo MIME check), max 20MB, max 3 slots; uploads via `wp_handle_upload` + `wp_insert_attachment` (attached to the draft post), generates thumbnails; stores `umgpc_photo_{n}_id`. Returns `{id, url}`.
- `umgpc_remove_photo` — clears the matching slot meta and force-deletes the attachment. 404 if the media ID is not in the caller's draft.
- `umgpc_upload_student_proof` — FormData field `student_proof`; JPEG/PNG/PDF, max 10MB, single slot (replaces and deletes any previous proof). Returns `{id, url, filename}`.
- `umgpc_remove_student_proof` — deletes the proof attachment and meta.

## Dependencies
- Internal: [jwt.php](jwt.php.md) (auth guard), [post-types.php](post-types.php.md) (CPT).
- External: WordPress media pipeline (`wp_handle_upload`, `wp_insert_attachment`, `wp_generate_attachment_metadata`, `wp_delete_attachment`), `WP_Query`, PHP `finfo`.

## Used by
Frontend draft functions (`getDraft`, `saveDraft`, `uploadPhoto`, `deletePhoto`, `uploadStudentProof`, `deleteStudentProof`) in [apps/umg/lib/auth/api.ts](../../../apps/umg/lib/auth/api.ts.md), used by the submission form ([apps/umg/app/photo-submission/components/SubmissionForm.tsx](../../../apps/umg/app/photo-submission/components/SubmissionForm.tsx.md)).

## Notes
- Post meta written: `umgpc_user_id`, `umgpc_status`, all text/consent fields, `umgpc_photo_{1-3}_{id,title,description}`, `umgpc_student_proof_id`, `umgpc_social_links`.
- Ownership is enforced by always resolving the draft from the JWT user — media IDs are only accepted if they match a slot on the caller's own draft.
- Upload responses use key `id` (not `media_id`); the old plugin doc claims `media_id`. Modification of a submitted entry returns HTTP 400 (not 403 as the old doc says).
- MIME type is checked from file contents (finfo), not the client-supplied type.
- **`umgpc_find_draft_id()` excludes `umgpc_school_batch` posts (2026-07-03 fix).** New [school.php](school.php.md) endpoints create independent `umg_submission` posts under the same `umgpc_user_id` for school/bulk registration. Without an exclusion, this function's `WP_Query` (matching only `umgpc_user_id`) would pick up a school-created application as if it were the account's individual draft — confirmed live via curl during school.php testing: a submitted school application leaked into `GET /draft` for the same account. Fixed by adding a `umgpc_school_batch NOT EXISTS` meta clause. Safe for existing individual-flow posts, which never have that meta key at all (NOT EXISTS matches "no such key present").

---
*Documented at commit 62e1c78.*
