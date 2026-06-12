# docs/plugin/united-media-ingestor/includes/incremental.php

**Purpose:** Keeps the local store current — fetches posts published since each site's cursor and upserts them.

## Responsibilities
The "new content" path complementing backfill's "archive" path. One pass loops all sites in `um_sites_config()`, fetches up to 100 posts after the stored `um_since_<site>` cursor, upserts each, and advances the cursor to the newest `date_gmt` seen.

## Key exports
- `um_run_incremental_once() -> {ok, message, summary[]}` — takes the shared ingest lock (no-ops if held); per site: `um_fetch_posts_since(base, cursor, 100)` → `um_upsert_article()` for each post → cursor advanced via `um_set_since()`. On a first run that returns nothing, the cursor is initialized to "now" so future runs only pick up genuinely new posts. Per-site fetch errors are recorded in the summary and skipped (other sites still run). 0.25s pause between sites.
- Admin-post hooks `um_incremental_run` and `um_incremental_reset` (manage_options, `print_r` output) — duplicated in [admin-endpoints.php](admin-endpoints.php.md); these load first and exit, so they win.

## Dependencies
- Internal: [helpers.php](helpers.php.md) (lock, cursors, tally), [http.php](http.php.md) (`um_fetch_posts_since`), [storage.php](storage.php.md) (`um_upsert_article`), [config.php](config.php.md) (`um_sites_config()`).
- External: source-site REST APIs; WordPress `admin_post_*` hooks.

## Used by
Cron hook `um_cron_incremental` (every 5 minutes, see [cron.php](cron.php.md)) and the "Run Incremental Update" / "Reset Cursors" buttons on the control page in [admin-endpoints.php](admin-endpoints.php.md).

## Notes
- Single fetch of `per_page=100` per site per pass — if a site publishes more than 100 posts between runs (unlikely at 5-minute cadence), the overflow is picked up on the next pass because the cursor only advances to the newest date actually fetched... but note posts are fetched newest-first, so a >100 burst would advance the cursor past unfetched older posts; backfill would catch them.
- Updates to already-ingested posts are only re-ingested if their `date` falls after the cursor — edits that don't change the publish date are not detected by this path.
- Cursors are stored per site in `um_since_<site_id>` options (ISO 8601 GMT).

---
*Documented at commit 1cbdce5.*
