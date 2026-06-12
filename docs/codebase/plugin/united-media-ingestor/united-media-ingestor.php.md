# docs/plugin/united-media-ingestor/united-media-ingestor.php

**Purpose:** Plugin bootstrap for "United Media Ingestor" — loads all includes, provides UMG's headless config (CORS/cache/redirect), and handles activation.

## Responsibilities
Entry point of the aggregation plugin on api.unitedmediadc.com. Defines `UMI_PATH`/`UMI_URL`, requires the 12 includes (config → helpers → http → normalize → mapping → storage → backfill → incremental → cron → admin-endpoints → rest-api → search), and embeds the headless config that the other two sites get from standalone plugins: whitelisted CORS, REST no-cache headers, and a 301 redirect of all non-`/wp-json` front-end traffic to `https://www.unitedmediadc.com`.

## Key exports
- `UMI_PATH`, `UMI_URL` (constants).
- Headless config hooks: `rest_api_init` (origin-whitelisted CORS via `um_allowed_origins()`), `rest_post_dispatch` (no-cache headers on all REST responses), `template_redirect` (301 to `UMI_REDIRECT_URL`).
- `um_activate_plugin() -> void` (activation hook) — schedules cron events (`um_schedule_cron_events()`), seeds the `um_category` taxonomy from the mapping spec, flushes rewrite rules.
- `um_populate_category_terms() -> void` — inserts parent terms from `um_category_parents()` then child terms from `um_category_children_spec()` (with parent linkage), logging failures via `um_log()`.
- Deactivation hook: `um_unschedule_cron_events`.

## Dependencies
- Internal: all of [includes/](includes/README.md) — see [includes/config.php](includes/config.php.md), [includes/helpers.php](includes/helpers.php.md), [includes/http.php](includes/http.php.md), [includes/normalize.php](includes/normalize.php.md), [includes/mapping.php](includes/mapping.php.md), [includes/storage.php](includes/storage.php.md), [includes/backfill.php](includes/backfill.php.md), [includes/incremental.php](includes/incremental.php.md), [includes/cron.php](includes/cron.php.md), [includes/admin-endpoints.php](includes/admin-endpoints.php.md), [includes/rest-api.php](includes/rest-api.php.md), [includes/search.php](includes/search.php.md)
- External: WordPress plugin/cron/taxonomy APIs.

## Used by
WordPress core as plugin main file. The `um/v1/articles` route it ultimately exposes is consumed by the shared API client ([packages/api/client.ts](../../packages/api/client.ts.md)) for the UMG site.

## Notes
- Category terms are only seeded on activation — adding new mappings later requires re-activating the plugin (or terms get auto-created as unmapped go untracked); `um_resolve_categories` assumes terms exist.
- The `template_redirect` 301 means the WP install serves nothing publicly except `/wp-json` and wp-admin — including the Divi search template path in [includes/search.php](includes/search.php.md), which is therefore mostly legacy (it can only render for logged-in admin contexts or if the redirect is removed).

---
*Documented at commit 1cbdce5.*
