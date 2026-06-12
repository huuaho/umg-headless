# docs/plugin/united-media-ingestor/includes/rest-api.php

**Purpose:** The plugin's public REST surface — `GET /wp-json/um/v1/articles`, the aggregated article feed the UMG frontend consumes.

## Responsibilities
Registers and serves the single public route. Queries `um_article` posts ordered by source publication date (meta `um_date_gmt` desc), filters excluded items by default, supports full-text search / source / category filters, and shapes each post + its meta into the JSON article card schema (never serving full article pages — readers follow `source_url` to the origin site).

## REST routes (namespace `um/v1`)
| Method | Path | Auth | Callback |
|--------|------|------|----------|
| GET | `/articles` | Public (`__return_true`) | `um_rest_get_articles` |

Query params: `search` (string, WP `s` search), `source` (site id), `category` (um_category slug, parent or child), `page` (default 1), `per_page` (default 20, max 100), `include_excluded` (default false), `include_content` (default false).

## Key exports
- `um_rest_get_articles(WP_REST_Request) -> {page, per_page, total, total_pages, items[]}` — `WP_Query` over `um_article` with meta/tax filters; each item: `{id, title, slug, date, source, source_label, source_url, excerpt (30 words), featured_image, images[], author_name, category (parent bucket name), categories[] ({id,name,slug,parent}), read_time_minutes (ceil(word_count/200), min 1), is_excluded, content? (um_plaintext, only when include_content=true)}`.

## Dependencies
- Internal: [storage.php](storage.php.md) (CPT/taxonomy + meta layout), [config.php](config.php.md) (meta key constants). CORS/no-cache for this route come from the headless config embedded in [../united-media-ingestor.php](../united-media-ingestor.php.md).
- External: WordPress REST + `WP_Query` + terms APIs.

## Used by
The UMG frontend via the shared API client ([packages/api/client.ts](../../../packages/api/client.ts.md), types in packages/api/types.ts) — homepage category sections, search, and article cards on www.unitedmediadc.com. The full request/response contract is also documented in `docs/wordpress-api.md` (note: that doc omits the `slug` field).

## Notes
- The `search` param uses WordPress native `s` (title + post_content, i.e. the stored excerpt) — it does **not** search `um_plaintext`; the deeper three-field search lives in [search.php](search.php.md) and is not exposed through this route.
- Ordering by `meta_value` of `um_date_gmt` is string ordering of ISO dates (correct lexicographically) but means articles missing that meta are dropped by the implicit meta join.
- `excerpt` is recomputed via `wp_trim_words(post_content, 30)` per request; `featured_image` is `''` (not null) when absent.
- Default exclusion filter accepts posts with no `um_is_excluded` meta or value `'0'`.

---
*Documented at commit 1cbdce5.*
