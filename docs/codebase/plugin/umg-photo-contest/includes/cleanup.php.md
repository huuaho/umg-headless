# docs/plugin/umg-photo-contest/includes/cleanup.php

**Purpose:** Weekly cron job that deletes abandoned draft submissions older than 90 days.

## Responsibilities
Frees Media Library space by purging drafts (never-submitted entries) that have had no activity for 90+ days, including their uploaded photos.

## Key exports
- `umgpc_run_cleanup() -> void` — queries up to 50 `umg_submission` posts with `umgpc_status = 'draft'` and `post_modified` older than 90 days; for each, force-deletes photo attachments in slots 1–3 then force-deletes the post.
- Hook: `add_action('umgpc_cleanup_orphaned_drafts', 'umgpc_run_cleanup')`.

## Dependencies
- Internal: relies on the schedule registered in [../umg-photo-contest.php](../umg-photo-contest.php.md) (weekly `umgpc_cleanup_orphaned_drafts` event) and the meta layout from [draft.php](draft.php.md).
- External: WP-Cron, `WP_Query`, `wp_delete_attachment`, `wp_delete_post`.

## Used by
WP-Cron only; nothing calls it via REST or admin.

## Notes
- `umgpc_save_draft` touches `post_modified` on every save specifically so active drafts aren't reaped.
- Gotcha: only photo slots 1–3 are deleted explicitly — the **student-proof attachment is not deleted** here. `wp_delete_post` does not cascade to attachments, so proofs on reaped drafts become orphaned media. (The old plugin doc incorrectly claims proofs are cleaned up.)
- Capped at 50 drafts per weekly run; a large backlog drains gradually.

---
*Documented at commit 1cbdce5.*
