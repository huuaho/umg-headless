# docs/plugin/umg-photo-contest/includes/cleanup.php

**Purpose:** Weekly cron job that deletes abandoned draft submissions older than 90 days.

## Responsibilities
Frees Media Library space by purging drafts (never-submitted entries) that have had no activity for 90+ days, including their uploaded photos.

## Key exports
- `umgpc_run_cleanup() -> void` — queries up to 50 published `umg_submission` posts with `umgpc_status = 'draft'` and `post_modified` older than 90 days; **skips any post for which `umgpc_entry_is_paid()` ([entry-state.php](entry-state.php.md)) is true**; for each remaining one, force-deletes photo attachments in slots 1–3 then force-deletes the post.
- Hook: `add_action('umgpc_cleanup_orphaned_drafts', 'umgpc_run_cleanup')`.

## Dependencies
- Internal: [entry-state.php](entry-state.php.md) (`umgpc_entry_is_paid`); relies on the schedule registered in [../umg-photo-contest.php](../umg-photo-contest.php.md) (weekly `umgpc_cleanup_orphaned_drafts` event) and the meta layout from [draft.php](draft.php.md) / [school.php](school.php.md).
- External: WP-Cron, `WP_Query`, `wp_delete_attachment`, `wp_delete_post`.

## Used by
WP-Cron only; nothing calls it via REST or admin.

## Notes
- `umgpc_save_draft` touches `post_modified` on every save specifically so active drafts aren't reaped.
- Gotcha: only photo slots 1–3 are deleted explicitly — the **student-proof attachment is not deleted** here. `wp_delete_post` does not cascade to attachments, so proofs on reaped drafts become orphaned media. (The since-deleted hand-written `docs/plugin/umg-photo-contest.md` incorrectly claimed proofs are cleaned up.)
- Capped at 50 drafts per weekly run; a large backlog drains gradually. Note the cap counts *queried* posts, so paid drafts that are skipped still consume slots in that batch (they sit in the same `umgpc_status = 'draft'` result set week after week).
- **Paid guard (added with the un-submit feature):** since `POST /unsubmit` / `POST /school/application/{id}/unsubmit` ([entry-state.php](entry-state.php.md)) can put an entry back to `draft`, an entry un-submitted right around the moment its payment settled would otherwise look like an abandoned draft and be reaped 90 days later. The guard covers both payment models (school: post meta; individual: user meta) — but see the `post_author` caveat in entry-state.php's Notes, which may mean the individual-flow half of that check is ineffective in practice.
- The school flow's applications share this CPT and status meta, so this cron reaps stale **school** drafts too (only 3 photo slots — matches school.php, which has no student proof).

---
*Documented at commit bde729d.*
