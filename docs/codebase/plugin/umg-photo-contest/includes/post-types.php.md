# docs/plugin/umg-photo-contest/includes/post-types.php

**Purpose:** Registers the `umg_submission` custom post type used as the contest's internal data store.

## Responsibilities
Registers a non-public CPT on `init`. Submissions are never rendered or exposed via the WP REST API — they exist purely as wp-admin-manageable records holding contestant data in post meta.

## Key exports
- `umgpc_register_post_types() -> void` — registers `umg_submission` with `public: false`, `publicly_queryable: false`, `show_ui: true` (wp-admin menu "Photo Contest", camera icon), `show_in_rest: false`, supports `title` + `custom-fields`.
- Hook: `add_action('init', 'umgpc_register_post_types')`.

## Dependencies
- Internal: none.
- External: WordPress `register_post_type`.

## Used by
- [draft.php](draft.php.md), [submission.php](submission.php.md), [cleanup.php](cleanup.php.md) query/create `umg_submission` posts.
- [../umg-photo-contest.php](../umg-photo-contest.php.md) calls it directly on activation before flushing rewrite rules.

## Notes
- One post per user (looked up by `umgpc_user_id` post meta); posts use `post_status: publish` while the actual workflow status lives in `umgpc_status` meta (`draft`/`submitted`).
- Editors review entries via wp-admin custom fields; there is no public or REST read path for submissions (a judges panel would need its own endpoint).

---
*Documented at commit 1cbdce5.*
