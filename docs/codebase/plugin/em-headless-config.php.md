# docs/plugin/em-headless-config.php

**Purpose:** Single-file WordPress plugin ("EM Headless Config") that makes api.echo-media.info behave as a headless backend: CORS, REST no-cache, frontend redirect, and GitHub auto-rebuild dispatch.

## Responsibilities
Deployed standalone to `wp-content/plugins/` on the Echo Media WordPress install. It whitelists the Echo Media frontend origins for REST CORS, disables caching of REST responses (so SiteGround edge cache cannot serve stale CORS headers), 301-redirects all non-`/wp-json` front-end traffic to the Next.js site, and fires a GitHub `repository_dispatch` event whenever a post is published, updated, trashed, or un-published so the static frontend rebuilds automatically.

## Key exports
- `rest_api_init` action — removes core `rest_send_cors_headers`, adds a `rest_pre_serve_request` filter that sets `Access-Control-Allow-Origin` + `Allow-Credentials` when the origin is one of `http://localhost:3000`, `https://www.echo-media.info`, `https://echo-media.info`.
- `rest_post_dispatch` filter — adds `Cache-Control: no-cache, no-store, must-revalidate`, `Pragma: no-cache`, `Expires: 0` to every REST response.
- `transition_post_status` action — for `post` type only, when the transition involves `publish` (draft→publish, publish→publish, publish→trash/draft; draft→draft is ignored), POSTs to `https://api.github.com/repos/huuaho/umg-headless/dispatches` with `event_type: deploy-echo-media`, authenticated by the `GH_REBUILD_TOKEN` constant. Silently skipped if the constant is undefined.
- `template_redirect` action — 301 to `https://www.echo-media.info` for every non-admin request whose URI does not start with `/wp-json`.

## Dependencies
- Internal: none — fully self-contained; the sibling [is-headless-config.php](is-headless-config.php.md) is the same pattern for International Spectrum, and the UMG equivalent is embedded in [united-media-ingestor/united-media-ingestor.php](united-media-ingestor/united-media-ingestor.php.md).
- External: WordPress REST/hook APIs, `wp_remote_post`, GitHub REST API (`repository_dispatch`), `GH_REBUILD_TOKEN` defined in `wp-config.php` (fine-grained PAT with Contents read/write on `huuaho/umg-headless`).

## Used by
WordPress core loads it as a plugin. The dispatch event is consumed by the GitHub Actions workflow ([.github/workflows/deploy-echo-media.yml](../.github/workflows/deploy-echo-media.yml.md)), which listens for `repository_dispatch: deploy-echo-media`. The CORS whitelist serves the Echo Media frontend's WP REST calls via the shared API client ([packages/api/client.ts](../packages/api/client.ts.md)).

## Notes
- The redirect means the EM backend serves nothing publicly except `/wp-json` and wp-admin.
- The dispatch request has a 10s timeout and its response is not checked — failed rebuild triggers are silent.
- No nonce/capability concerns: all hooks are passive configuration; the only secret is `GH_REBUILD_TOKEN`, kept out of the repo in `wp-config.php`.

---
*Documented at commit 1cbdce5.*
