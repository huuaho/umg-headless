# docs/plugin/umg-photo-contest/includes/admin-tools.php

**Purpose:** A native wp-admin page (Tools → Retitle Submissions) for bulk-fixing submission titles site-wide — deliberately built outside the REST API.

## Responsibilities
Adds one Tools submenu page that recomputes the `post_title` of every `umg_submission` post (individual and school-batch alike) from its currently-stored owner/name meta, regardless of which account owns it. Exists specifically because no REST endpoint in this plugin can safely do this: the JWT auth used everywhere else only ever grants "subscriber"-level access (every account `request-code` creates is a subscriber — see [auth.php](auth.php.md)), so there's no capability tier a bearer token could carry that would justify touching every user's submissions. Gating this by real WordPress admin session (`current_user_can`) instead sidesteps that gap entirely.

## Key exports
- `umgpc_retitle_all_submissions() -> array{retitled:int,skipped:int}` — `WP_Query`s every `umg_submission` post (`post_status: any`, no owner/status filter), and for each one calls `umgpc_school_compute_title()` ([school.php](school.php.md)) or `umgpc_compute_draft_title()` ([draft.php](draft.php.md)) depending on whether `umgpc_school_batch` meta is set, applying the returned title via `wp_update_post`. Only applies the result if it's a string (`is_string()`) — posts with no name on file yet (`null`) or hitting rare sequence-number lock contention (`WP_Error('lock_busy', ...)`, school posts only) are both left untouched and counted as skipped; re-running the tool retries either.
- `umgpc_render_retitle_page()` — renders the Tools page: `current_user_can('manage_options')` gate (`wp_die` otherwise), a nonce-protected form, and a success notice reporting the retitled/skipped counts after running.
- Hook: `add_action('admin_menu', ...)` registers the page via `add_management_page('Retitle Submissions', ..., 'manage_options', 'umgpc-retitle-submissions', 'umgpc_render_retitle_page')`.

## Dependencies
- Internal: `umgpc_school_compute_title()` ([school.php](school.php.md)), `umgpc_compute_draft_title()` ([draft.php](draft.php.md)) — this file's whole job is calling these two functions across every post.
- External: WordPress admin API (`add_management_page`, `current_user_can`, `wp_nonce_field`/`wp_verify_nonce`, `submit_button`), `WP_Query`.

## Used by
Nothing programmatic — this is a human-triggered wp-admin Tools page, reached via the WordPress admin menu, not called by any other plugin file or the frontend.

## Notes
- **Why this couldn't be a REST endpoint:** the two per-owner retitle endpoints (`POST /umg/v1/draft/retitle`, `POST /umg/v1/school/application/{id}/retitle`) are safe because they're scoped to the caller's own post via the existing ownership checks. An "all submissions, any owner" version has no such scope to check — gating it by JWT alone would let any registered applicant (anyone who's ever requested a login code) trigger a site-wide bulk-mutate. Native wp-admin `manage_options` capability is the only boundary in this plugin that actually distinguishes "an administrator" from "any applicant."
- Idempotent and safe to run repeatedly — every action here only touches `post_title`, never application content, and recomputing an already-correct title is a no-op in practice.
- User-tested locally (a separate local WordPress install, not the school/checkout flow's production-only setup) before deploying to production.
- **Sequence numbering for legacy school applications is not guaranteed chronological when backfilled via this tool** — this tool's `WP_Query` visits every account's applications in WordPress's default date-DESC order (not grouped or ordered per account), and [school.php](school.php.md)'s `umgpc_school_next_seq()` (called through `umgpc_school_compute_title()`) numbers whatever it's asked about, in call order, not post date. A cosmetic limitation, not a bug — `umgpc_school_seq` is never used for anything load-bearing — see that file's "Round 5" notes for why this was deliberately accepted rather than chased further after several earlier attempts to force chronological order each introduced new bugs. No change needed in this file either way, since this tool's own job (call compute_title, apply the result) isn't the source of the numbering behavior.
- Full context: `claude-context/current-work/bulk-registration/implementation-checklist.md`'s "Data-quality / wp-admin polish" section.

---
*Documented at commit e5821d4.*
