# docs/plugin/umg-photo-contest/includes/school.php

**Purpose:** School/bulk-registration REST endpoints — full CRUD for multiple independent applications under one WordPress account (day-one stopgap for the school registration feature).

## Responsibilities
Lets one authenticated account (a school) own and manage **many** `umg_submission` posts at once — application create/list/get/update/delete, photo upload/remove, and submit — where the individual-applicant flow in [draft.php](draft.php.md) assumes exactly one. Each school-created post is marked with `umgpc_school_batch = '1'` so it never collides with `draft.php`'s single-draft lookup. Student-proof upload is intentionally not offered here (waived for school applications per product decision). This is new, additive-only code: no function in `draft.php`, `submission.php`, or `payment.php` is modified except one exclusion filter in `umgpc_find_draft_id()` (see [draft.php](draft.php.md) Notes).

## REST routes (namespace `umg/v1`, all Bearer JWT)
| Method | Path | Callback |
|--------|------|----------|
| GET | `/school/applications` | `umgpc_school_list_applications` |
| POST | `/school/applications` | `umgpc_school_create_application` |
| GET | `/school/application/(?P<id>\d+)` | `umgpc_school_get_application` |
| PUT | `/school/application/(?P<id>\d+)` | `umgpc_school_update_application` |
| DELETE | `/school/application/(?P<id>\d+)` | `umgpc_school_delete_application` |
| POST | `/school/application/(?P<id>\d+)/photo` | `umgpc_school_upload_photo` |
| DELETE | `/school/application/(?P<id>\d+)/photo/(?P<mediaId>\d+)` | `umgpc_school_remove_photo` |
| POST | `/school/application/(?P<id>\d+)/submit` | `umgpc_school_submit_application` |

## Key exports
- Helpers: `umgpc_school_find_applications($user_id) -> int[]` (all `umg_submission` posts with matching `umgpc_user_id` AND `umgpc_school_batch = '1'`, oldest first), `umgpc_school_get_owned_application($post_id, $user_id) -> int|WP_Error` (ownership check; always returns 404, never 403, so existence never leaks to a non-owner), `umgpc_school_build_summary($post_id) -> array` (`{id, division, first_name, last_name, status, payment_status}`).
- `umgpc_school_list_applications` — summaries of every application the caller owns.
- `umgpc_school_create_application` — creates a blank `umg_submission` post, stamps `umgpc_user_id`, `umgpc_status = draft`, `umgpc_school_batch = '1'`, `umgpc_payment_status = unpaid`. Returns `{id}`.
- `umgpc_school_get_application` — full detail, same field shape as `draft.php`'s `umgpc_get_draft` minus `student_proof`, plus `payment_status`/`payment_date` (post meta, not the account-level meta `draft.php`/`payment.php` use).
- `umgpc_school_update_application` — upsert, same field list and photo-metadata matching as `umgpc_save_draft`. 400 `already_submitted` once finalized.
- `umgpc_school_delete_application` — hard-deletes the post and any attached photo attachments. 400 `already_submitted` if finalized (submitted applications are never deletable via this API).
- `umgpc_school_upload_photo` / `umgpc_school_remove_photo` — same validation as `draft.php`'s photo endpoints (JPEG only, 20MB max, 3 slots), scoped to a specific application id instead of find-or-create.
- `umgpc_school_submit_application` — mirrors `umgpc_submit_entry` ([submission.php](submission.php.md)): no server-side field validation, just a status flip + `umgpc_submitted_at` timestamp, scoped by ownership.

## Dependencies
- Internal: [jwt.php](jwt.php.md) (auth guard), [post-types.php](post-types.php.md) (CPT), reuses `umgpc_build_photos_array()` from [draft.php](draft.php.md) (function, not the draft-lookup logic).
- External: WordPress media pipeline (`wp_handle_upload`, `wp_insert_attachment`, `wp_generate_attachment_metadata`, `wp_delete_attachment`), `WP_Query`, PHP `finfo`.

## Used by
Not yet consumed by the frontend — this is backend-only so far, verified live via curl against the deployed plugin. Frontend commits are tracked in `claude-context/current-work/bulk-registration/implementation-checklist.md` (commits 5-9).

## Notes
- Post meta written: `umgpc_user_id`, `umgpc_status`, `umgpc_school_batch`, `umgpc_payment_status`, `umgpc_payment_date` (payment-date set by a future webhook change, not this file), all the same text/consent/photo meta keys `draft.php` uses.
- Live-tested (2026-07-03): create/list/get/update/delete round-trip, ownership isolation (a second account gets 404 on another's application, both GET and DELETE), the 3-photo cap, post-submission lock on edit/delete/photo-upload, and the core multi-student scenario — one account with 4 independently tracked applications (mixed draft/submitted), including pausing and resuming one mid-way. All confirmed working.
- A real bug was caught during this testing and fixed in [draft.php](draft.php.md): `umgpc_find_draft_id()` had no `umgpc_school_batch` exclusion, so a school-created application was leaking into the individual `/draft` endpoint for the same account. See that file's Notes.
- Payment tracking here is **not yet live-credited** — `umgpc_payment_status`/`umgpc_payment_date` exist as post meta and are returned by the API, but nothing sets them to `paid` yet. That's the next commit: a new branch in [payment.php](payment.php.md)'s webhook keyed on `purpose = school_bulk_entry`, pending a second Stripe Payment Link (Dashboard action) and user sign-off, per `claude-context/current-work/bulk-registration/implementation-checklist.md` commit 4.
- Full design rationale and the day-one-stopgap-vs-fast-follow scoping decision: `claude-context/current-work/bulk-registration/school-bulk-registration-plan.md`.

---
*Documented at commit 62e1c78.*
