# docs/plugin/united-media-ingestor/includes/storage.php

**Purpose:** Registers the `um_article` CPT + `um_category` taxonomy and implements the upsert that turns a raw remote post into a local article record.

## Responsibilities
The persistence layer. Registers the internal-only data-store CPT and hierarchical taxonomy, hard-404s any attempt to render a single `um_article` on the front end, deduplicates by `(source_site, remote_post_id)`, and on upsert extracts and stores everything the REST layer later serves: title, excerpt, full plaintext, word count, featured + gallery + content images, author, dates, source identity, and resolved categories.

## Key exports
- `init` action — registers `um_article` (`public: false`, `show_ui: true` for admin debugging, `show_in_rest: false`, supports title/editor/custom-fields) and `um_category` (hierarchical, `public: false`, `show_in_rest: true`).
- `template_redirect` action — 404s `is_singular('um_article')` as extra safety.
- `um_article_unique_key($site_id, $remote_post_id) -> string`.
- `um_find_article_id($site_id, $remote_post_id) -> int` — meta-query dedupe lookup (0 if absent).
- `um_local_count_for_site($site_id) -> int` — direct SQL count for the admin status tables.
- `um_upsert_article($site, $remote_post) -> {ok, action: inserted|updated, post_id} | {ok: false, error}` — the workhorse:
  1. Title/excerpt/plaintext normalization, word count.
  2. Image collection: featured (`_embedded['wp:featuredmedia']`) first, then gallery IDs resolved via `um_fetch_media_urls()` (extra HTTP round-trip), then `<img>` URLs from content; deduped, stored as JSON.
  3. Author from custom `authors[0].display_name`, falling back to `_embedded.author[0].name`, falling back to "Not Credited".
  4. Insert or update the post (excerpt stored in `post_content` for native search), write identity + display metas, verify the two critical identity metas were set.
  5. Category resolution via `um_resolve_categories()`: assigns `um_category` terms, tracks unmapped names, sets `um_is_excluded`/`um_excluded_reason` when excluded.
- `um_track_unmapped_categories($site_id, $names)` — accumulates `{site_id, category_name, count, first_seen, last_seen}` in option `um_unmapped_categories` for admin review.

## Dependencies
- Internal: [config.php](config.php.md) (meta key constants), [normalize.php](normalize.php.md) (extractors), [mapping.php](mapping.php.md) (`um_resolve_categories`), [http.php](http.php.md) (`um_fetch_media_urls`), [helpers.php](helpers.php.md) (`um_log`).
- External: WordPress post/meta/taxonomy APIs, `$wpdb`.

## Used by
`um_upsert_article` is called per post by [backfill.php](backfill.php.md), [incremental.php](incremental.php.md), and re-used in spirit by the image-refresh handler in [admin-endpoints.php](admin-endpoints.php.md); `um_local_count_for_site` by the admin status views; the CPT/taxonomy underpin [rest-api.php](rest-api.php.md) and [search.php](search.php.md).

## Notes
- Post meta written per article: `um_source_site`, `um_remote_post_id`, `um_source_url`, `um_remote_slug`, `um_date_gmt`, `um_date_local`, `um_source_label`, `um_featured_image_url`, `um_author_name`, `um_image_urls` (JSON), `um_plaintext`, `um_word_count`, `um_is_excluded`, `um_excluded_reason`, `um_raw_min` (JSON).
- Image URLs are hotlinked from the source sites — nothing is downloaded into the local Media Library.
- Excluded articles are still fully ingested and categorized (`UMI_INGEST_EXCLUDED = true`); exclusion is just a meta flag filtered at read time.
- Updates fully overwrite display fields but the `um_unmapped_categories` option only ever grows; there is no admin UI to review/clear it yet.

---
*Documented at commit 1cbdce5.*
