# docs/plugin/united-media-ingestor/includes/normalize.php

**Purpose:** Pure input→output normalization/extraction helpers for raw remote post JSON (no side effects).

## Responsibilities
Transforms pieces of a `wp/v2/posts?_embed=1` payload into clean values: category names from `_embedded['wp:term']`, decoded plain-text titles/excerpts, a best-effort GMT date, gallery attachment IDs parsed out of shortcodes, and full-size image URLs scraped from content HTML.

## Key exports
- `um_extract_remote_categories($remote_post) -> string[]` — walks `_embedded['wp:term']` groups, keeping only `taxonomy === 'category'` term names (tags ignored).
- `um_normalize_title($raw) -> string` / `um_normalize_excerpt($raw) -> string` — strip tags + HTML-entity decode.
- `um_normalize_date_gmt($remote_post) -> string` — `date_gmt`, falling back to `date`, falling back to now.
- `um_extract_gallery_ids($content_html) -> int[]` — regex-parses Divi `[et_pb_gallery gallery_ids="…"]` and core `[gallery ids="…"]` shortcodes; deduped positive ints.
- `um_extract_content_image_urls($content_html) -> string[]` — all `<img src>` http(s) URLs, converted to full size.
- `um_get_full_size_image_url($url) -> string` — strips WordPress dimension suffixes (`-400x284.jpg` → `.jpg`).

## Dependencies
- Internal: none (pure functions).
- External: WordPress sanitization helpers (`wp_strip_all_tags`, `sanitize_text_field`, `esc_url_raw`).

## Used by
[storage.php](storage.php.md) (`um_upsert_article` calls the category/gallery/image extractors) and [admin-endpoints.php](admin-endpoints.php.md) (image-refresh AJAX handler re-runs the gallery/image extraction). Category names feed [mapping.php](mapping.php.md)'s `um_resolve_categories`.

## Notes
- `um_get_full_size_image_url` is heuristic — a filename that legitimately ends in `-<w>x<h>` would be mangled, and the "full size" URL is never verified to exist.
- Shortcode parsing is regex-based; gallery formats beyond Divi/core (e.g. block galleries that render as `<figure>`) are only caught by the `<img>` scrape.

---
*Documented at commit 1cbdce5.*
