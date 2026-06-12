# docs/plugin/united-media-ingestor/includes/http.php

**Purpose:** All outbound HTTP to the source WordPress sites — fetch posts (page/since/before/offset), fetch media URLs, read pagination totals, with retry/backoff.

## Responsibilities
The only file that performs `wp_remote_get`. Builds `wp/v2/posts` URLs against a source site's base, decodes JSON, retries server errors (HTTP 5xx) up to 3 times with growing sleeps (0.5s/1s/1.5s), and normalizes the `x-wp-total` / `x-wp-totalpages` headers into post counts.

## Key exports
- `um_is_valid_base_url($base) -> bool`, `um_build_posts_url($base, $params) -> string` — URL helpers (RFC 3986 query encoding).
- `um_http_get($url, $attempts = 3) -> {ok, error, data, headers}` — core request: `UMI_HTTP_TIMEOUT`, `UMI_SSL_VERIFY`, `Accept: application/json`, `UMI_HTTP_USER_AGENT`; retries only on `HTTP 5xx`.
- `um_fetch_posts_page($base, $page, $per_page, $offset = null)` — page-based backfill fetch (`_embed=1`, date desc); optional absolute `offset` powers the binary search for corrupt articles.
- `um_fetch_posts_since($base, $after_iso, $per_page = 30)` — incremental fetch using the `after` param.
- `um_fetch_posts_before($base, $before_iso, $per_page = 25)` — cursor-based backfill using the `before` param (avoids deep-pagination 500s).
- `um_fetch_single_article($base, $offset)` — `per_page=1` + absolute offset, for single-article backfill mode.
- `um_fetch_media_urls($base, $media_ids) -> {ok, data: [{id, source_url}]}` — resolves gallery attachment IDs via `wp/v2/media?include=…` (max 100 IDs, 2 attempts).
- `um_get_site_post_totals($base) -> {ok, total, pages}` — single-item fetch reading `x-wp-total`/`x-wp-totalpages`; safely unwraps `CaseInsensitiveDictionary` headers.

## Dependencies
- Internal: [config.php](config.php.md) (timeout, SSL verify, user agent constants).
- External: source sites' public WP REST APIs (`/wp-json/wp/v2/posts`, `/wp-json/wp/v2/media`) on api.echo-media.info, api.internationalspectrum.org, diplomaticwatch.com; WordPress HTTP API.

## Used by
[backfill.php](backfill.php.md) (page/before/single fetch + totals), [incremental.php](incremental.php.md) (`um_fetch_posts_since`), [storage.php](storage.php.md) (`um_fetch_media_urls` during upsert), [admin-endpoints.php](admin-endpoints.php.md) (totals for status tables; direct `um_http_get` of single posts in the image-refresh AJAX handler).

## Notes
- `UMI_SSL_VERIFY` is currently `false` (see [config.php](config.php.md)) — every call here skips TLS verification.
- Non-5xx failures (timeouts, 4xx, JSON decode errors) are not retried by the backoff loop; callers handle them (backfill treats `HTTP 400/404` past page 1 as end-of-archive).
- `um_get_site_post_totals` uses a single attempt, so a transient failure shows as "Error" in the admin status table without affecting ingestion.

---
*Documented at commit 1cbdce5.*
