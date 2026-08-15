# docs/plugin/umg-photo-contest/includes/submission.php

**Purpose:** Individual-flow REST endpoints that flip a draft to `submitted` — and, until payment, back to `draft` again.

## Responsibilities
Finalizes (or un-finalizes) the authenticated user's single draft: no data is re-uploaded (photos already live in the Media Library); the endpoints only change the workflow status and timestamp. Since the entry-state refactor, this file owns just the *lookup* (`umgpc_find_draft_id`) — the transitions and their guards live in [entry-state.php](entry-state.php.md), shared with the school flow.

## REST routes (namespace `umg/v1`)
| Method | Path | Auth | Callback |
|--------|------|------|----------|
| POST | `/submit` | Bearer JWT | `umgpc_submit_entry` |
| POST | `/unsubmit` | Bearer JWT | `umgpc_unsubmit_entry` |

## Key exports
- `umgpc_submit_entry(WP_REST_Request) -> response` — finds the user's draft (404 `no_draft` if none), then delegates to `umgpc_entry_submit()`: 400 `already_submitted` on re-submission, otherwise sets `umgpc_status = 'submitted'` and `umgpc_submitted_at = current_time('mysql')`. Returns `{success: true}`.
- `umgpc_unsubmit_entry(WP_REST_Request) -> response` — finds the user's draft (404 `no_draft`), then delegates to `umgpc_entry_unsubmit()`: 400 `not_submitted` if not currently submitted, 403 `entry_final` if the entry is paid (`umgpc_entry_is_paid()`), otherwise sets `umgpc_status = 'draft'` and deletes `umgpc_submitted_at`. Returns `{success: true}`. Lets an entrant reopen the form to edit before paying; after payment entries are final per the rights statement.

## Dependencies
- Internal: [jwt.php](jwt.php.md) (auth guard), [draft.php](draft.php.md) (`umgpc_find_draft_id`), [entry-state.php](entry-state.php.md) (`umgpc_entry_submit`, `umgpc_entry_unsubmit`).
- External: WordPress post meta API (via entry-state.php).

## Used by
Frontend `submitEntry` / `unsubmitEntry` in [apps/umg/lib/auth/api.ts](../../../apps/umg/lib/auth/api.ts.md), called from the submission form ([SubmissionForm.tsx](../../../apps/umg/app/photo-submission/components/SubmissionForm.tsx.md)) — submit at the end of the flow, un-submit from the "edit" affordance shown while the entry is submitted-but-unpaid.

## Notes
- No server-side validation that the draft is complete (photos present, consents checked, payment made) — completeness and the payment gate are enforced client-side. The endpoint will happily submit an empty draft.
- While submitted, every draft mutation endpoint in [draft.php](draft.php.md) returns 400 `already_submitted`; the way back is `POST /unsubmit`, which is blocked once paid. After payment there is no API path to edit — an admin would have to change the post meta in wp-admin.
- Un-submitting removes the entry from the judge panel's listing ([judging.php](judging.php.md)) until it is re-submitted; any scores already saved on it are kept as post meta.
- The 403 `entry_final` guard for the individual flow depends on `umgpc_entry_is_paid()` resolving the owner via `post_author` — see the caveat in [entry-state.php](entry-state.php.md) Notes (unverified whether `post_author` is actually populated on JWT-created drafts).
- Historically (before commit `3e9c801` "editable form until paid") there was no un-submit API at all; the school flow gained the identical endpoint in the same change (`fa4b6ac`).

---
*Documented at commit bde729d.*
