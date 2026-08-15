# docs/plugin/umg-photo-contest/includes/judging.php

**Purpose:** Capability-gated REST surface for the judge/admin dashboard — list and read submitted entries (blind by default), upsert the caller's own per-entry score, and (admins only) a cross-judge aggregated, per-division-ranked results table.

## Responsibilities
Backs the frontend judge panel at [apps/umg/app/admin/](../../../apps/umg/app/admin/README.md) (`/admin`, `/admin/entry/[id]`, `/admin/results`). Every route requires a bearer JWT **plus** a capability via `umgpc_require_cap()` ([roles.php](roles.php.md)) — the first endpoints in this plugin that read entries the caller does not own. Only entries with `umgpc_status = 'submitted'` are ever visible (individual and school-batch alike; there is no per-flow distinction here). Scores are stored per judge as post meta on the entry; a judge only ever sees their **own** score, and other judges' scores surface solely through the admin-only aggregation. The plugin is deliberately **criteria-agnostic**: the frontend defines the rubric (from `apps/umg/lib/competitions/current.ts`) and sends stable slug keys; the plugin validates only shape and range, so rubric edits never require a plugin change.

## REST routes (namespace `umg/v1`)
| Method | Path | Capability | Callback |
|--------|------|------------|----------|
| GET | `/admin/submissions` | `umgpc_judge_submissions` | `umgpc_admin_list_submissions` |
| GET | `/admin/submissions/(?P<id>\d+)` | `umgpc_judge_submissions` | `umgpc_admin_get_submission` |
| PUT | `/admin/submissions/(?P<id>\d+)/score` | `umgpc_judge_submissions` | `umgpc_admin_save_score` |
| GET | `/admin/results` | `umgpc_admin_results` | `umgpc_admin_results` |

## Key exports
- Constants: `UMGPC_SCORE_MIN = 1`, `UMGPC_SCORE_MAX = 10` — the inclusive per-criterion integer range.
- Helpers: `umgpc_get_submitted_entry($post_id) -> WP_Post|WP_Error` (404 `not_found` if not an `umg_submission`; 404 `not_submitted` if status isn't submitted — a draft is indistinguishable from nonexistent to a judge), `umgpc_get_judge_score($post_id, $judge_id) -> array|null` (decodes `umgpc_score_{judgeId}` JSON), `umgpc_get_all_scores($post_id) -> array` (every `umgpc_score_*` meta on the post, keyed by judge id), `umgpc_judging_photos($post_id, $size) -> array` (slots 1–3 → `{url, title, description}` using `wp_get_attachment_image_url($size)` with a full-URL fallback — no uploader info), `umgpc_entry_identity($post_id) -> array` (`{first_name, last_name, school, grade, recommender}` — the PII block that blind judging withholds).
- `umgpc_admin_list_submissions` — query params `division` (exact `umgpc_division` match), `page` (≥1), `per_page` (1–100, default 50). `WP_Query` on submitted entries, `post_status: any`, ordered by ID ASC. Returns `{entries: [{id, division, submitted_at, photos (medium), my_score_status: 'unscored'|'draft'|'final', my_total, identity?}], total, page, per_page, blind}`. `identity` is included only when `!umgpc_is_blind_judging() || user_can(umgpc_admin_results)`; `blind` reports the inverse so the UI can label itself.
- `umgpc_admin_get_submission` — one entry: `{id, division, submitted_at, photos (large), biography, my_score, blind, identity?}`. `my_score` is only ever the caller's own record (or `null`).
- `umgpc_admin_save_score` — JSON body `{scores: {slugKey: int, ...}, status?: 'draft'|'final', notes?, criteria_version?}`. Guards: 400 `invalid_body` (non-JSON), 409 `score_final` if the caller's existing score is `final` and the caller lacks `umgpc_admin_results` (a judge's finalized score is locked; admins may still overwrite, e.g. to unlock), 422 `invalid_scores` (empty map, non-slug key after `sanitize_title`, or non-numeric value), 422 `score_out_of_range`. Writes `umgpc_score_{userId}` = JSON `{judge_id, scores, total (sum), notes (sanitize_textarea_field), criteria_version, status, updated_at}` and returns that record. Any status other than the literal `final` is stored as `draft`.
- `umgpc_admin_results` — admin only. Loads **all** submitted entries (`posts_per_page: -1`), and for each computes `judge_count`, `final_count`, `average_total` (mean of judges' totals, 2 dp, `null` if unscored), and `criterion_averages` per slug key. Always includes `identity` (admins are never blind). Sorts by division then `average_total` desc, then assigns a per-division `rank` (1-based; `null` for unscored entries, which sort last). Returns `{results: [...]}`.

## Dependencies
- Internal: [roles.php](roles.php.md) (`umgpc_require_cap`, `umgpc_is_blind_judging`), [jwt.php](jwt.php.md) (transitively, via `umgpc_require_cap`); reads the meta layout written by [draft.php](draft.php.md) / [school.php](school.php.md) (`umgpc_status`, `umgpc_division`, `umgpc_photo_{n}_*`, name/school/grade/biography/recommender) and [entry-state.php](entry-state.php.md)'s `umgpc_submitted_at`.
- External: `WP_Query`, WordPress post meta, `wp_get_attachment_image_url`, `wp_json_encode`.

## Used by
Frontend [apps/umg/lib/judging/api.ts](../../../apps/umg/lib/judging/api.ts.md) (`listSubmissions`, `getSubmission`, `saveScore`, `getResults`, plus `criterionKey()` which produces the slug keys this file expects), consumed by the `/admin` pages under `apps/umg/app/admin/` behind [AdminGuard.tsx](../../../apps/umg/app/admin/AdminGuard.tsx.md) (which checks the `is_judge` flag from [auth.php](auth.php.md)).

## Notes
- Post meta written: `umgpc_score_{judgeId}` (JSON string), one per judge per entry — averages are computed on read, nothing is cached. All other meta is read-only here.
- **Draft vs final scores both count in aggregation** — `average_total` averages every stored score regardless of `status`; `final_count` is reported alongside so the admin UI can show how many are locked in. Un-submitting an entry ([entry-state.php](entry-state.php.md)) hides it from every route here but leaves its `umgpc_score_*` meta intact, so it reappears with scores if re-submitted.
- `criteria_version` is stored verbatim and never validated — the frontend uses it to detect a rubric that changed after a score was saved; the plugin's `total` is simply the sum of whatever keys were sent, so scores saved under different rubrics are averaged together in `/admin/results` without any warning server-side.
- The listing uses `post_status: 'any'`, which (as noted in [school.php](school.php.md)) silently excludes trashed posts — a trashed-but-still-`submitted` entry disappears from judging, which is the intended behavior here.
- `permission_callback` is `__return_true` on all four routes, as elsewhere in the plugin — authorization is done inside the callbacks via `umgpc_require_cap()`, not by the REST permission layer.
- Shipped as "judge panel v1" (2026-07-04) alongside the frontend `/admin` pages; parked awaiting client UX feedback (see `claude-context/paused-work/judge-panel-parked.md`).

---
*Documented at commit bde729d.*
