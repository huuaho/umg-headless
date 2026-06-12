# docs/plugin/united-media-ingestor/includes/cron.php

**Purpose:** WP-Cron wiring — custom intervals, scheduled incremental/backfill events, and the "server backfill" start/stop control functions.

## Responsibilities
Registers three custom intervals, provides the schedule/unschedule functions invoked by the plugin's activation/deactivation hooks, attaches handlers that run the ingestion runners on schedule, and implements the option-driven "server backfill" mode the admin UI exposes (an every-minute aggressive backfill that auto-stops on completion).

## Key exports
- `cron_schedules` filter — adds `um_every_minute` (60s), `um_every_5_minutes`, `um_every_15_minutes`.
- `um_schedule_cron_events()` — schedules `um_cron_incremental` (every 5 min, gated by `UMI_ENABLE_INCREMENTAL`) and `um_cron_backfill` (every 15 min, gated by `UMI_ENABLE_AUTORUN_BACKFILL`). Called from the activation hook in [../united-media-ingestor.php](../united-media-ingestor.php.md).
- `um_unschedule_cron_events()` — clears all three events (including `um_cron_server_backfill`); called on deactivation.
- Cron handlers: `um_cron_incremental` → `um_run_incremental_once()`; `um_cron_backfill` → `um_run_backfill_batch()`; `um_cron_server_backfill` → runs a batch only while option `um_server_backfill_active` is truthy, records `um_server_backfill_last_run`, and on `state.done` calls `um_stop_server_backfill()` + records `um_server_backfill_completed`.
- Server backfill controls: `um_start_server_backfill()` (sets active flag + `um_server_backfill_started`, schedules the every-minute event), `um_stop_server_backfill()`, `um_is_server_backfill_active() -> bool`, `um_get_server_backfill_status() -> {active, started, last_run, completed, next_run}`.

## Dependencies
- Internal: [backfill.php](backfill.php.md), [incremental.php](incremental.php.md) (runners), [config.php](config.php.md) (enable toggles), `um_sites_config()`.
- External: WP-Cron (`wp_schedule_event`, `wp_next_scheduled`, `wp_unschedule_event`), options API.

## Used by
- [../united-media-ingestor.php](../united-media-ingestor.php.md): `register_activation_hook` → `um_schedule_cron_events` (via `um_activate_plugin`), `register_deactivation_hook` → `um_unschedule_cron_events`.
- [admin-endpoints.php](admin-endpoints.php.md): start/stop buttons (`admin_post_um_start_server_backfill` / `um_stop_server_backfill`) and the status banner call the control/status functions.

## Notes
- Options: `um_server_backfill_active`, `um_server_backfill_started`, `um_server_backfill_last_run`, `um_server_backfill_completed` (autoload off).
- The standing cron handlers gate on the compile-time constants `UMI_ENABLE_*`, not the `um_backfill_autorun_enabled` option toggled by the admin "Auto-Run" button — that option is effectively cosmetic (see [helpers.php](helpers.php.md)).
- WP-Cron is traffic-driven; on the redirect-locked API backend, "every minute" only fires as often as requests hit WordPress (REST traffic from the frontend usually suffices).
- The concurrency between an every-minute server backfill and the 5-minute incremental is safe — both runners share the `um_ingest_lock_v1` lock and skip when it's held.

---
*Documented at commit 1cbdce5.*
