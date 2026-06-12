# docs/plugin/umg-newsletter/includes/cors.php

**Purpose:** CORS preflight and response headers for the subscribe endpoint, deferring to the photo contest plugin when present.

## Responsibilities
Handles `OPTIONS` preflight for `/wp-json/umg/v1/subscribe` on the `init` hook, and conditionally installs a response-level CORS filter only if the photo contest plugin's handler (which covers the whole `umg/v1` namespace) is not loaded — avoiding duplicate `Access-Control-*` headers.

## Key exports
- `init` action (anonymous) — answers `OPTIONS` requests whose URI contains `/wp-json/umg/v1/subscribe` with origin-whitelisted CORS headers (`POST, OPTIONS`; `Content-Type, Accept`), then exits 200.
- Conditional `rest_api_init` action — registered only when `!function_exists('umgpc_allowed_origins')`; removes core `rest_send_cors_headers` and adds a `rest_pre_serve_request` filter setting `Access-Control-Allow-Origin`/`Allow-Credentials` for whitelisted origins.

## Dependencies
- Internal: [config.php](config.php.md) (`umg_nl_allowed_origins()`).
- External: WordPress REST hooks, `get_http_origin()`; coexistence check against [../../umg-photo-contest/includes/config.php](../../umg-photo-contest/includes/config.php.md) (`umgpc_allowed_origins`).

## Used by
Browser requests from [packages/ui/NewsletterSignup.tsx](../../../packages/ui/NewsletterSignup.tsx.md) to the subscribe endpoint.

## Notes
- The preflight handler always runs regardless of the photo contest plugin (both `init` handlers can fire, but each exits after responding; the photo contest one matches the broader `/wp-json/umg/v1` prefix first if both are active — outcome is identical headers either way).
- Unlike the photo contest CORS file, this one does not add no-cache headers; it relies on the other plugin (or the ingestor) for that when co-installed.

---
*Documented at commit 1cbdce5.*
