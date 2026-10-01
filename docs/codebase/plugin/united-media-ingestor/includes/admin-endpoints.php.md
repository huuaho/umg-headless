# docs/plugin/united-media-ingestor/includes/admin-endpoints.php

**Purpose:** The wp-admin "Ingestor Control" page plus all admin-post/AJAX handlers — manual runs, continuous run, server backfill, category/site re-sync, image refresh, settings, status, delete-by-source, and delete-all.

## Responsibilities
Largest file in the plugin (~1,660 lines, mostly UI). Renders the control panel under UM Articles → Ingestor Control: per-site status table (local count vs remote total, current site highlighted), backfill controls (single batch, JS continuous loop, reset), a "Re-sync Source Category" form (source-site dropdown + category-slug field; blank slug = whole site), server backfill start/stop with auto-refreshing banner, image refresh, incremental controls with cursor display, a danger zone (per-source delete + delete-all), and a settings form for the option-backed tuning constants. Also decorates the UM Articles list (source column with color badge + "View Original" link, sortable, quick-link notice).

## Key exports (hooks)
All handlers require `manage_options`; `*_redirect` and AJAX/settings handlers additionally verify nonces (`check_admin_referer`).

Admin menu / UI:
- `admin_menu` — submenu page `um-ingestor-control` → `um_render_control_page()` (HTML + inline jQuery for the continuous-run and image-refresh loops).
- `admin_notices` — action-result notices on the control page; quick-link banner on the `edit-um_article` list.
- `manage_um_article_posts_columns` / `manage_um_article_posts_custom_column` / `manage_edit-um_article_sortable_columns` / `pre_get_posts` — Source column (badge color per site, link to original) and sorting by `um_source_site`.

`admin_post_*` (raw `print_r` output; duplicated registrations — see Notes): `um_backfill_run`, `um_backfill_reset`, `um_incremental_run`, `um_incremental_reset`, `um_autorun_on`, `um_autorun_off`, `um_status`.

`admin_post_*_redirect` (nonce-checked, redirect back to control page): `um_backfill_run_redirect`, `um_backfill_reset_redirect`, `um_autorun_on_redirect`, `um_autorun_off_redirect`, `um_incremental_run_redirect`, `um_incremental_reset_redirect`, `um_start_server_backfill`, `um_stop_server_backfill`, `um_save_settings` (persists options `um_per_page`, `um_http_timeout`, `um_backfill_pages_per_run`, `um_backfill_mode` with clamping), `um_delete_all_redirect` (force-deletes every `um_article`, resets backfill state and incremental cursors).

Delete by source (added 0.12.0, to retire Diplomatic Watch):
- `admin_post_um_delete_by_source_redirect` — nonce-checked (`um_delete_by_source`); force-deletes every `um_article` whose `UMI_SOURCE_SITE_META_KEY` matches one source id via `wp_delete_post($id, true)` (bypasses trash), leaving the other sources untouched. It then `delete_option(um_since_key($source))` — done explicitly because `um_reset_all_since()` only walks `um_sites_config()` and would orphan a retired source's cursor forever — and calls `um_backfill_reset_state()`, because backfill state holds a numeric `site_index` into `um_sites_config()` and those indices shift when a source is dropped. Redirects back with `um_action=deleted_source` + count, rendered as a dedicated `admin_notices` warning.
- The Danger Zone's source dropdown is built from a `GROUP BY` over `postmeta` on `UMI_SOURCE_SITE_META_KEY` (with per-source counts), **not** from `um_sites_config()` — deliberately, so a source already removed from the config can still be purged; ids missing from the config are labelled "(not in config)". The submit button confirms with the exact article count via a `data-count` attribute.

Re-sync (added 0.10.0, whole-site mode in the follow-up):
- `admin_post_um_resync_category` — nonce-checked; runs `um_populate_category_terms()` first (so freshly added mapping terms exist), then `um_resync_source_category()`, and redirects back with the result message in `um_resync`.
- `um_resync_source_category($site_id, $category_slug = '') -> {ok, message}` — resolves the *source site's own* category slug to a remote category ID via `wp/v2/categories` (blank slug skips this and re-syncs every post on the site), then pages through `wp/v2/posts?_embed=1` newest-first (50/page) calling `um_upsert_article()` per post. Synchronous, capped at `UM_RESYNC_MAX_POSTS` (500) posts per click; treats an HTTP 400 past page 1 as end-of-pages (WP's `rest_post_invalid_page_number`). Use it after adding/changing a mapping, or when the source changed something the incremental cron never re-reads (e.g. post authors), without a full backfill.

`wp_ajax_*` (admin-auth JSON):
- `um_backfill_ajax` — one `um_run_backfill_batch()` per call; driven in a loop by the "Run Continuous" button.
- `um_refresh_images_ajax` — batches of 10 articles: re-fetches each remote post by ID (`/wp-json/wp/v2/posts/<id>?_embed=1`), re-extracts featured/gallery/content images, rewrites `um_image_urls`; returns `{done, total, processed, updated, skipped, failed, next_offset}`.
- `um_status_ajax` — per-site `{local, remote, mode, status}` rows for the live-updating status table.

## Dependencies
- Internal: [backfill.php](backfill.php.md), [incremental.php](incremental.php.md), [cron.php](cron.php.md) (server backfill controls/status), [helpers.php](helpers.php.md) (state/cursors/autorun), [http.php](http.php.md) (totals, single-post fetch, re-sync paging), [normalize.php](normalize.php.md) (image extraction in refresh), [storage.php](storage.php.md) (`um_local_count_for_site`, `um_upsert_article` in re-sync), [config.php](config.php.md) (constants + options it edits), [../united-media-ingestor.php](../united-media-ingestor.php.md) (`um_populate_category_terms` before re-sync).
- External: WordPress admin-post/AJAX/admin-UI APIs, jQuery (`ajaxurl`), `$wpdb`.

## Used by
WordPress admins only — nothing here is public REST. The settings it saves become the `UMI_*` constants on the next request (frozen at load in [config.php](config.php.md)).

## Notes
- `admin_post_um_backfill_run`, `um_backfill_reset`, `um_incremental_run`, `um_incremental_reset` are registered both here and in [backfill.php](backfill.php.md)/[incremental.php](incremental.php.md); since each handler exits after output and those files load first, the earlier registrations execute. The legacy non-`_redirect` handlers also lack nonce checks (capability check only) — the UI buttons use the nonce-checked `_redirect` variants.
- Delete-all loops `wp_delete_post(…, true)` per article — slow on thousands of posts and not batched; it runs within one request. Delete-by-source has the same shape and the same risk: Diplomatic Watch is ~2,597 articles in one synchronous request.
- Delete-by-source exists precisely because delete-all was too blunt for retiring one source — using it to drop Diplomatic Watch would also have destroyed the ~214 remaining Echo Media + International Spectrum articles and forced a full re-backfill.
- The Source-column badge color map still contains `'diplomaticwatch' => '#0073aa'` even though that source is gone from [config.php](config.php.md). That is intentional for now — it keeps DW rows legible while an admin performs the purge — and the map falls back to `#999` for unknown ids, so the entry is simply dead once the purge is done.
- The status table's "Complete" check is `local >= remote_total`, which can read Complete even when different articles were skipped.
- The image-refresh loop is browser-driven (page must stay open), unlike server backfill which is cron-driven.
- The re-sync runs in a single synchronous request — a whole-site re-sync of a large source can approach PHP time limits, and anything past the newest 500 posts is silently skipped (no cursor/continuation; click again won't advance past the cap).

---
*Documented at commit 0c47b38.*
