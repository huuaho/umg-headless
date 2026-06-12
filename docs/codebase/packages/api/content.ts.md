# packages/api/content.ts

**Purpose:** WordPress content sanitization — strips Divi builder shortcodes and block-editor image markup, and extracts image URLs / gallery IDs from raw `content.rendered` HTML.

## Responsibilities
- Strips Divi `[et_pb_*]` shortcode wrappers while preserving inner HTML (`<p>`, `<strong>`, `<a>`, etc.). `[et_pb_image src=...]` becomes a plain `<img>`; `[et_pb_gallery]` is removed entirely (its images are resolved separately via the media API).
- Decodes WP's HTML-entity-encoded quotes (`&#8221;`, `&#8243;`, `&quot;`, ...) inside shortcode brackets only, so attribute regexes can match.
- Removes Gutenberg `wp-block-gallery` / `wp-block-image` `<figure>` blocks from the body (with depth tracking for nested figures) to avoid duplicating images already shown in the FeaturedMedia gallery.
- Extracts every image URL from both Divi `src` attributes and `<img>` tags, converting WP thumbnail URLs (`photo-150x150.jpg`) to full size.
- Extracts `gallery_ids` from `[et_pb_gallery]` shortcodes for async resolution by the caller.

## Key exports
- `processContent(rawHtml) -> { html, images, galleryIds }` — one-stop processing: clean HTML + deduped image URLs + gallery media IDs.
- `stripDiviShortcodes(html) -> string` — Divi shortcode removal (also collapses 3+ newlines).
- `extractGalleryIds(rawHtml) -> number[]` — parses comma-separated media IDs from gallery shortcodes.
- `toFullSizeUrl(url) -> string` — strips the `-WxH` size suffix WP appends to resized images.

## Dependencies
- Internal: none
- External: none (pure regex/string functions)

## Used by
- [wp-client.ts](wp-client.ts.md) (`processContent`, `toFullSizeUrl` during `WpPost → ApiArticle` conversion)
- Re-exported from the package barrel [index.ts](index.ts.md)

## Notes
- Pure functions, no IO — the only module in `packages/api` with no fetch calls.
- Regex-based HTML processing: adequate for WP output but not a real HTML parser; unusual nesting could slip through.
- Gallery images are intentionally *not* inlined into the HTML — callers resolve `galleryIds` via `GET /wp/v2/media` (see [wp-client.ts](wp-client.ts.md) `resolveMediaIds`).

---
*Documented at commit 1cbdce5.*
