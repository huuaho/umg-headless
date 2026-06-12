# docs/plugin/umg-photo-contest/includes/cors.php

**Purpose:** CORS preflight handling and response headers for the `/wp-json/umg/v1` REST namespace.

## Responsibilities
Answers `OPTIONS` preflight requests for `umg/v1` routes before WordPress routing kicks in, replaces WordPress's default CORS handler with an origin-whitelisted one, and disables caching on REST responses.

## Key exports
- `init` action (anonymous) — intercepts `OPTIONS` requests whose URI contains `/wp-json/umg/v1`; if the `Origin` header is in `umgpc_allowed_origins()`, emits `Access-Control-Allow-Origin/Credentials/Methods/Headers/Max-Age` headers, then exits with 200.
- `rest_api_init` action (anonymous) — removes core `rest_send_cors_headers` and adds a `rest_pre_serve_request` filter that sets `Access-Control-Allow-Origin` + `Allow-Credentials` for whitelisted origins.
- `rest_post_dispatch` filter (anonymous) — adds `Cache-Control: no-cache, no-store, must-revalidate`, `Pragma: no-cache`, `Expires: 0` to **all** REST responses.

## Dependencies
- Internal: [config.php](config.php.md) (`umgpc_allowed_origins()`).
- External: WordPress REST hooks (`rest_pre_serve_request`, `rest_post_dispatch`), `get_http_origin()`.

## Used by
Implicitly by every browser request from the UMG frontend ([apps/umg/lib/auth/api.ts](../../../apps/umg/lib/auth/api.ts.md)) to `/wp-json/umg/v1/*`, including the newsletter `subscribe` route (the photo-contest CORS handler covers the whole `umg/v1` namespace when both plugins are active).

## Notes
- The replaced `rest_pre_serve_request` filter and the no-cache filter affect the entire REST API on the WP install, not just `umg/v1` — by design, since the same backend also serves the ingestor (which installs an equivalent handler).
- The no-cache headers exist to stop SiteGround edge caching from serving stale CORS headers across origins.

---
*Documented at commit 1cbdce5.*
