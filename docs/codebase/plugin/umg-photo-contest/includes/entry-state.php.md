# docs/plugin/umg-photo-contest/includes/entry-state.php

**Purpose:** The one shared implementation of the entry lifecycle (`draft → submitted → paid`) used by both the individual flow and the school flow — status transitions, their guards, and a payment-model-agnostic "is this entry paid?" check.

## Responsibilities
Before this file existed, [submission.php](submission.php.md) and [school.php](school.php.md) each hand-rolled the same "flip to submitted" meta writes. This file centralizes every status transition so route handlers keep only what genuinely differs between the two flows (ownership lookup: `umgpc_find_draft_id()` vs `umgpc_school_get_owned_application()`), and adds the *reverse* transition — un-submitting an entry so it can be edited again before payment — with the "paid entries are final" rule enforced in exactly one place. No routes are registered here; it is a pure helper library loaded early in the bootstrap (right after post-types, before jwt/auth) so every later include can call it.

## Key exports
- `umgpc_entry_is_paid($post_id) -> bool` — true if the post's own `umgpc_payment_status` meta is `paid` (school flow: credited per application by [payment.php](payment.php.md)'s batch webhook) **or** the user meta `umgpc_payment_status` of `$post->post_author` is `paid` (individual flow: payment tracked per user). Checking both is what lets callers ignore which flow an entry belongs to. See Notes for a caveat about `post_author`.
- `umgpc_entry_submit($post_id) -> true|WP_Error` — 400 `already_submitted` if already submitted; otherwise sets `umgpc_status = 'submitted'` and `umgpc_submitted_at = current_time('mysql')`. Called by `POST /submit` ([submission.php](submission.php.md)) and `POST /school/application/{id}/submit` ([school.php](school.php.md)).
- `umgpc_entry_unsubmit($post_id) -> true|WP_Error` — 400 `not_submitted` if the entry isn't currently submitted; 403 `entry_final` if `umgpc_entry_is_paid()` (per the rights statement, paid entries can no longer be edited); otherwise sets `umgpc_status = 'draft'` and deletes `umgpc_submitted_at`. Called by `POST /unsubmit` and `POST /school/application/{id}/unsubmit`.

## Dependencies
- Internal: none (reads the meta layout written by [draft.php](draft.php.md), [school.php](school.php.md), and [payment.php](payment.php.md)).
- External: WordPress post/user meta API, `get_post()`.

## Used by
- [submission.php](submission.php.md) — `umgpc_entry_submit`, `umgpc_entry_unsubmit`.
- [school.php](school.php.md) — `umgpc_entry_submit`, `umgpc_entry_unsubmit` (submit/unsubmit endpoints).
- [cleanup.php](cleanup.php.md) — `umgpc_entry_is_paid` (never reaps a paid entry's draft).

## Notes
- Meta touched: `umgpc_status`, `umgpc_submitted_at` (written/deleted); `umgpc_payment_status` on post and user (read only).
- **The state machine is deliberately reversible only until payment.** Un-submitting clears `umgpc_submitted_at`, so a re-submitted entry gets a fresh timestamp. Once un-submitted, an entry drops out of every "submitted" query — including the judge panel's listing in [judging.php](judging.php.md) and the school flow's "submitted-unpaid" checkout set — until it is submitted again.
- **School race, accepted by design (with a caveat):** the source comment on `umgpc_school_unsubmit_application()` says an application inside an already-created Checkout Session that settles *after* being un-submitted "still gets credited by the webhook — resubmitting reconciles it." Reading [payment.php](payment.php.md)'s `umgpc_mark_school_batch_paid()`, that is only true if the application was **re-submitted before** the settlement event arrives: the webhook re-validates `umgpc_status === 'submitted'` per post and *skips and logs* anything still in draft, so an application un-submitted at settlement time is paid for by the school but not marked paid, and re-submitting it afterwards would put it back into the next checkout's "submitted-unpaid" set (a potential double charge unless reconciled by hand from the webhook log). Nothing in the un-submit path checks for an in-flight checkout lock (`umgpc_school_checkout_lock_at`) — worth knowing if this ever shows up in support. The individual flow has no equivalent race because payment there is user-level, not post-level.
- The paid-guard here is also why [cleanup.php](cleanup.php.md) now refuses to reap paid drafts: an entry un-submitted for edits around the moment its payment settled would otherwise sit in `draft` status and eventually be deleted by the weekly cron.
- **Gotcha, unverified at runtime — `post_author` on individual entries.** The individual-flow check reads `get_user_meta($post->post_author, ...)`, but nothing in this plugin ever sets `post_author` explicitly: `umgpc_create_draft()` in [draft.php](draft.php.md) calls `wp_insert_post()` without it, and the JWT layer ([jwt.php](jwt.php.md)) never calls `wp_set_current_user()`, so under a Bearer-token REST request WordPress defaults `post_author` to `0`. If that holds in production, `umgpc_entry_is_paid()` can never return true for an individual entry via the user-meta path — meaning `POST /unsubmit` would not actually block a paid individual entrant, and cleanup's paid-guard would not protect individual drafts. The intended lookup key for the individual flow is the `umgpc_user_id` post meta (what every other file uses); this was spotted while documenting and not confirmed against a live install, so treat it as something to check, not an established bug. School-flow entries are unaffected (post meta path).

---
*Documented at commit bde729d.*
