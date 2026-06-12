# docs/plugin/united-media-ingestor/includes/backfill.php

**Purpose:** Resume-safe archive ingestion — batched page/cursor backfill with binary-search corrupt-article skipping, plus a simple single-article mode.

## Responsibilities
Walks each source site's full post archive (sites in config order), upserting every post locally. Progress lives in the persistent backfill state option, so each invocation processes only `UMI_BACKFILL_PAGES_PER_RUN` units and can be resumed by cron, AJAX loop, or manual button. Handles the messy reality of the source sites: corrupt remote articles that 500 are isolated via binary search (batch mode) or skipped after 3 retries (single mode), and `HTTP 400/404` past page 1 is treated as normal end-of-archive.

## Key exports
- `um_run_backfill_batch(array $sites) -> array` — main entry; takes the ingest lock, routes to single-article mode when `UMI_BACKFILL_MODE === 'single'`, otherwise runs batch mode. Per site supports two strategies from `backfill_mode` in [config.php](config.php.md): `page` (default; paginated, with binary search on errors) and `before_cursor` (date-cursor walk that avoids deep-pagination 500s; on repeated failure skips the cursor back one day). Initializes state on first run (preloading remote totals), advances `site_index`/`page`/`cursor`, returns `{ok, message, site, mode, next_page, cursor, inserted, updated, skipped, failed, state}`.
- `um_run_backfill_single_article(array $sites) -> array` — fetches one post per absolute offset (`um_fetch_single_article`), `UMI_BACKFILL_PAGES_PER_RUN` articles per run, 0.4s pause between; failures after the built-in 3 HTTP retries are logged to `state['skipped_articles']` and skipped.
- `um_handle_fetch_error($state, $site, $page, $per_page, $error) -> {action: retry|skip_article|pause, …}` — the binary-search state machine: first failure halves the window; after 3 failures at the same position keeps halving down to `per_page = 1`, at which point the exact corrupt article offset is recorded in `skipped_articles` and skipped; otherwise pauses for manual retry.
- Admin-post hooks `um_backfill_run` and `um_backfill_reset` (manage_options, echo `print_r` output) — **duplicates** of the ones in [admin-endpoints.php](admin-endpoints.php.md); this file loads first, so its closures win (each exits after output).

## Dependencies
- Internal: [helpers.php](helpers.php.md) (lock, state, tally), [http.php](http.php.md) (page/before/single/totals fetches), [storage.php](storage.php.md) (`um_upsert_article`), [config.php](config.php.md) (`UMI_PER_PAGE`, `UMI_BACKFILL_PAGES_PER_RUN`, `UMI_BACKFILL_MODE`), `um_sites_config()`.
- External: WordPress `admin_post_*` hooks; source-site REST APIs (via http.php).

## Used by
- Cron hooks `um_cron_backfill` / `um_cron_server_backfill` in [cron.php](cron.php.md).
- Admin UI in [admin-endpoints.php](admin-endpoints.php.md): "Run Single Batch", "Run Continuous" (AJAX `um_backfill_ajax`), server backfill, reset.

## Notes
- State option `um_backfill_state_v1` fields include `site_index`, `site_id`, `page`, `cursor`, `per_page`, `done`, `totals`, `last_error`, `failure_count`, `binary_search_*`, `skipped_pages`, `skipped_ranges`, `skipped_articles` — the admin control page renders most of these.
- Both runners no-op (`ok: true`, "already running") when the lock is held; pauses release the lock and persist `last_error` so the UI can show it.
- Sleeps (0.2–0.4s) between requests are deliberate rate-limiting against the shared-host source sites.
- `UMI_BACKFILL_PAGES_PER_RUN` means "pages" in batch mode but "articles" in single mode — the setting is intentionally reused.

---
*Documented at commit 1cbdce5.*
