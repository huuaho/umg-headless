# docs/plugin/united-media-ingestor/includes/helpers.php

**Purpose:** Shared utilities — ingest lock, backfill/incremental state options, autorun toggle, logging, and upsert tallying.

## Responsibilities
Houses the small cross-cutting helpers every runner uses: an atomic options-based lock that prevents overlapping ingest runs, getters/setters for the persistent backfill state and per-site incremental cursors, the autorun on/off option, debug logging, and the shared counter logic for upsert results.

## Key exports
- `um_acquire_lock($ttl = UMI_INGEST_LOCK_TTL) -> bool` / `um_release_lock()` — lock stored in option `um_ingest_lock_v1`; uses `add_option()` for an atomic insert, falls back to overwriting an expired lock (`expires` timestamp check).
- `um_backfill_get_state() -> array` / `um_backfill_set_state($state)` / `um_backfill_reset_state()` — backfill progress in option `um_backfill_state_v1` (autoload off).
- `um_get_since($site_id) -> string` / `um_set_since($site_id, $iso8601)` / `um_reset_all_since()` — per-site incremental cursors in options `um_since_<site_id>`.
- `um_autorun_is_enabled() -> bool` / `um_autorun_set($enabled)` — option `um_backfill_autorun_enabled`.
- `um_log($message, $level = 'info')` — `error_log` with `[UM]`/`[UM WARN]`/`[UM ERROR]` prefix, only when `WP_DEBUG` is on.
- `um_tally_upsert_result($result, &$inserted, &$updated, &$skipped, &$failed)` — folds one `um_upsert_article()` result into the four counters (shared by backfill and incremental).
- `um_normalize_text($s) -> string`, `um_array_get($arr, $key, $default)` — small utilities.

## Dependencies
- Internal: [config.php](config.php.md) (`UMI_INGEST_LOCK_TTL`, `um_sites_config()` for cursor reset).
- External: WordPress options API.

## Used by
[backfill.php](backfill.php.md) and [incremental.php](incremental.php.md) (lock, state, cursors, tallying), [cron.php](cron.php.md) (indirectly via the runners), [admin-endpoints.php](admin-endpoints.php.md) (state/cursor display and reset, autorun toggle), [../united-media-ingestor.php](../united-media-ingestor.php.md) (`um_log`).

## Notes
- Options written: `um_ingest_lock_v1`, `um_backfill_state_v1`, `um_since_<site>`, `um_backfill_autorun_enabled` — all with autoload disabled.
- The lock TTL (default 180s) means a crashed run self-heals after 3 minutes; a healthy run releases explicitly.
- `um_autorun_is_enabled()` is *display-only* in practice — the cron handlers gate on the compile-time `UMI_ENABLE_*` constants, not this option (see [cron.php](cron.php.md)).

---
*Documented at commit 1cbdce5.*
