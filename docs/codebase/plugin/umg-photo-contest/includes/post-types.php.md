# docs/plugin/umg-photo-contest/includes/post-types.php

**Purpose:** Registers the `umg_submission` custom post type used as the contest's internal data store.

## Responsibilities
Registers a non-public CPT on `init`. Submissions are never rendered or exposed via the WP REST API — they exist purely as wp-admin-manageable records holding contestant data in post meta.

## Key exports
- `umgpc_register_post_types() -> void` — registers `umg_submission` with `public: false`, `publicly_queryable: false`, `show_ui: true` (wp-admin menu "Photo Contest", camera icon), `show_in_rest: false`, supports `title` + `custom-fields`.
- Hook: `add_action('init', 'umgpc_register_post_types')`.
- `umgpc_cascade_delete_submission_media($post_id, $post) -> void` — hooked on `before_delete_post`; for any `umg_submission` post, deletes its up-to-3 photo attachments and student-proof document from the Media Library whenever the post is **permanently** deleted, regardless of how (wp-admin "Delete Permanently", WP-CLI, the cleanup cron, or a plugin endpoint).

## Dependencies
- Internal: none.
- External: WordPress `register_post_type`, `before_delete_post` action, `wp_delete_attachment`.

## Used by
- [draft.php](draft.php.md), [submission.php](submission.php.md), [cleanup.php](cleanup.php.md), [school.php](school.php.md) query/create `umg_submission` posts.
- [../umg-photo-contest.php](../umg-photo-contest.php.md) calls `umgpc_register_post_types()` directly on activation before flushing rewrite rules.
- `umgpc_cascade_delete_submission_media` fires automatically for every `umg_submission` deletion site-wide — no other file calls it directly.

## Notes
- One post per user for the individual flow (looked up by `umgpc_user_id` post meta, excluding school-batch posts — see [draft.php](draft.php.md)); school accounts own many posts via [school.php](school.php.md). Posts use `post_status: publish` while the actual workflow status lives in `umgpc_status` meta (`draft`/`submitted`).
- Editors review entries via wp-admin custom fields; there is no public or REST read path for submissions (a judges panel would need its own endpoint).
- **Cascade-delete media (added 2026-07-03), and why it was needed:** WordPress core's `wp_delete_post()` does **not** delete child attachments by default — it only detaches them (sets `post_parent` to 0), leaving orphaned Media Library files. This was confirmed live: deleting submissions directly in wp-admin left their photos behind. The `before_delete_post` hook here closes that gap for every deletion path, not just the plugin's own delete endpoints (which already deleted photos manually before calling `wp_delete_post()`, so this hook is a harmless no-op redundancy for those — `wp_delete_attachment()` on an already-gone attachment ID is safe). Only fires on **permanent** deletion, not "Move to Trash" — a two-step wp-admin trash-then-delete flow still triggers it on the second step.

---
*Documented at commit e5821d4.*
