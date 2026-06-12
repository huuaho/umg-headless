# docs/plugin/is-headless-config.php

**Purpose:** Single-file WordPress plugin ("IS Headless Config") for api.internationalspectrum.org: CORS, REST no-cache, GitHub auto-rebuild, plus IS-specific `video_url` post meta and an `author_display_name` REST field.

## Responsibilities
The International Spectrum counterpart of [em-headless-config.php](em-headless-config.php.md), with three extras for the Video Interviews feature and author display: it registers a `video_url` post meta exposed in REST, gives editors a dedicated "Video URL (YouTube)" meta box (instead of the raw Custom Fields panel), and adds the author's display name directly onto post REST responses (working around REST user-endpoint permissions that block `_embed` author data). The front-end redirect present in the EM plugin exists here too but is **commented out** ("TEMPORARILY DISABLED for WP access").

## Key exports
- `rest_api_init` action (CORS) — removes core `rest_send_cors_headers`, whitelists `http://localhost:3000`, `https://www.internationalspectrum.org`, `https://internationalspectrum.org` via `rest_pre_serve_request`.
- `init` action — `register_post_meta('post', 'video_url', …)` with `show_in_rest: true`, single string, default `''`.
- `add_meta_boxes` action — side meta box `is_video_url` on posts rendering a URL input with nonce field.
- `save_post` action — verifies the `is_video_url_nonce`, skips autosaves, checks `edit_post` capability, saves `video_url` via `sanitize_url`.
- `rest_api_init` action (field) — `register_rest_field('post', 'author_display_name', …)` returning `get_the_author_meta('display_name', …)`.
- `rest_post_dispatch` filter — no-cache headers on all REST responses (same as EM).
- `transition_post_status` action — GitHub `repository_dispatch` with `event_type: deploy-international-spectrum` (same trigger rules and `GH_REBUILD_TOKEN` constant as EM).
- `template_redirect` 301 to `https://www.internationalspectrum.org` — **present but commented out**.

## Dependencies
- Internal: none (self-contained; pattern shared with [em-headless-config.php](em-headless-config.php.md)).
- External: WordPress meta/REST/hook APIs, `wp_remote_post`, GitHub REST API, `GH_REBUILD_TOKEN` in `wp-config.php`.

## Used by
WordPress core as a plugin. The dispatch event triggers [.github/workflows/deploy-international-spectrum.yml](../.github/workflows/deploy-international-spectrum.yml.md). The `video_url` meta and `author_display_name` field are consumed by the International Spectrum frontend's WP REST calls (shared client: [packages/api/client.ts](../packages/api/client.ts.md)) — `video_url` powers the embedded YouTube player on article pages.

## Notes
- Because the redirect is disabled, the IS backend's WordPress theme is still publicly reachable — re-enable the commented block to lock it down like EM/UMG.
- `author_display_name` exists precisely because `_embed` author data is permission-blocked for anonymous REST requests; the frontend should read this field rather than `_embedded.author`.
- The preexisting `docs/plugin/headless-config-plugins.md` describes the redirect as active for IS and omits the `video_url`/`author_display_name` features — the code here is authoritative.

---
*Documented at commit 1cbdce5.*
