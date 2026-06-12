# docs/plugin/umg-photo-contest/includes/submission.php

**Purpose:** Final-submission REST endpoint that flips a draft to `submitted`.

## Responsibilities
Finalizes the authenticated user's draft: no data is re-uploaded (photos already live in the Media Library); the endpoint only changes the workflow status and timestamps the submission.

## REST routes (namespace `umg/v1`)
| Method | Path | Auth | Callback |
|--------|------|------|----------|
| POST | `/submit` | Bearer JWT | `umgpc_submit_entry` |

## Key exports
- `umgpc_submit_entry(WP_REST_Request) -> response` — finds the user's draft (404 `no_draft` if none), rejects re-submission (400 `already_submitted`), then sets post meta `umgpc_status = 'submitted'` and `umgpc_submitted_at = current_time('mysql')`. Returns `{success: true}`.

## Dependencies
- Internal: [jwt.php](jwt.php.md) (auth guard), [draft.php](draft.php.md) (`umgpc_find_draft_id`).
- External: WordPress post meta API.

## Used by
Frontend `submitEntry` in [apps/umg/lib/auth/api.ts](../../../apps/umg/lib/auth/api.ts.md), called at the end of the submission form flow.

## Notes
- No server-side validation that the draft is complete (photos present, consents checked, payment made) — completeness and the payment gate are enforced client-side. The endpoint will happily submit an empty draft.
- Once submitted, every draft mutation endpoint returns 400 `already_submitted` — there is no un-submit API; an admin would have to edit the post meta in wp-admin.

---
*Documented at commit 1cbdce5.*
