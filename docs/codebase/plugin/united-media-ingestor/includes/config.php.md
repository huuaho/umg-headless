# docs/plugin/united-media-ingestor/includes/config.php

**Purpose:** Canonical source-site list, CORS origins, redirect URL, and all ingestion tuning constants.

## Responsibilities
Single place for: the three remote WordPress sites that get aggregated, headless config values for the UMG backend, HTTP tuning, backfill/incremental toggles, and the post-meta key names used for article identity.

## Key exports
- `um_sites_config() -> array` — ordered list of source sites: `echo-media` (api.echo-media.info), `internationalspectrum` (api.internationalspectrum.org), `diplomaticwatch` (diplomaticwatch.com); each with `id`, `base`, `label`, `backfill_mode` (all currently `page`; `before_cursor` is also supported by the backfill runner). Order matters — smaller sites first.
- `um_allowed_origins() -> string[]` — `http://localhost:3000`, `https://www.unitedmediadc.com`, `https://unitedmediadc.com`.
- `UMI_REDIRECT_URL` = `https://www.unitedmediadc.com`.
- Tuning constants, several backed by admin-editable options: `UMI_PER_PAGE` (option `um_per_page`, default 25), `UMI_BACKFILL_PAGES_PER_RUN` (option `um_backfill_pages_per_run`, default 1), `UMI_HTTP_TIMEOUT` (option `um_http_timeout`, default 60s), `UMI_BACKFILL_MODE` (option `um_backfill_mode`, `batch`|`single`, default `batch`).
- `UMI_SSL_VERIFY` = **false** (temporary — remote cert issues), `UMI_HTTP_USER_AGENT`.
- Toggles: `UMI_ENABLE_AUTORUN_BACKFILL` = true, `UMI_ENABLE_INCREMENTAL` = true, `UMI_INGEST_LOCK_TTL` = 180s.
- Storage behavior: `UMI_INGEST_EXCLUDED` = true, meta key names `UMI_EXCLUDED_META_KEY` (`um_is_excluded`), `UMI_SOURCE_URL_META_KEY` (`um_source_url`), `UMI_SOURCE_SITE_META_KEY` (`um_source_site`), `UMI_REMOTE_ID_META_KEY` (`um_remote_post_id`).

## Dependencies
- Internal: none (loaded first by [../united-media-ingestor.php](../united-media-ingestor.php.md)).
- External: WordPress `get_option` (constants are frozen from options at load time).

## Used by
Every other include in the plugin; options behind the constants are edited via the Settings form in [admin-endpoints.php](admin-endpoints.php.md).

## Notes
- Security: `UMI_SSL_VERIFY = false` disables TLS verification on all outbound fetches — flagged as temporary in the code.
- Because option-backed constants are defined at plugin load, settings changes take effect on the next request, not mid-run.

---
*Documented at commit 1cbdce5.*
