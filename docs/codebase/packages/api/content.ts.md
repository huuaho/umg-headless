# packages/api/content.ts

**Purpose:** WordPress content processing — two modes over the same raw `content.rendered` HTML: the legacy sanitizer that strips images out of the body, and the block parser that keeps them in the position the author gave them.

## Responsibilities
- Strips Divi `[et_pb_*]` shortcode wrappers while preserving inner HTML (`<p>`, `<strong>`, `<a>`, etc.). `[et_pb_image src=...]` becomes a plain `<img>`; `[et_pb_gallery]` is removed entirely (its images are resolved separately via the media API).
- Decodes WP's HTML-entity-encoded quotes (`&#8221;`, `&#8243;`, `&quot;`, ...) inside shortcode brackets only, so attribute regexes can match.
- Removes Gutenberg `wp-block-gallery` / `wp-block-image` `<figure>` blocks from the body (with depth tracking for nested figures) — the legacy path, which pairs with hoisting every image into one FeaturedMedia carousel above the article.
- Splits the same raw HTML into **ordered blocks** (`parseContentBlocks`) for the current article layout: text chunks, standalone images and galleries, each kept where the author placed it. This is the inverse of the strip-and-hoist path above.
- Extracts every image URL from both Divi `src` attributes and `<img>` tags, converting WP thumbnail URLs (`photo-150x150.jpg`) to full size.
- Extracts `gallery_ids` from `[et_pb_gallery]` shortcodes for async resolution by the caller.

## Key exports
- `parseContentBlocks(rawHtml) -> ContentBlock[]` — ordered body blocks. Finds every marker in the **raw** string (Gutenberg `wp-block-image` / `wp-block-gallery` figures, Divi `[et_pb_gallery]`), sorts by offset and splits; text between markers is Divi-stripped per chunk. Divi galleries come back with `ids` and an empty `images` — the caller resolves them.
- `ContentBlock` — `{type:"html", html}` | `{type:"image", src, caption?}` | `{type:"gallery", images, ids?}`.
- `processContent(rawHtml) -> { html, images, galleryIds }` — legacy one-stop processing: image-stripped HTML + deduped image URLs + gallery media IDs. Still the source of `ApiArticle.images[]`.
- `stripDiviShortcodes(html) -> string` — Divi shortcode removal (also collapses 3+ newlines).
- `extractGalleryIds(rawHtml) -> number[]` — parses comma-separated media IDs from gallery shortcodes.
- `toFullSizeUrl(url) -> string` — strips the `-WxH` size suffix WP appends to resized images.

## Dependencies
- Internal: none
- External: none (pure regex/string functions)

## Used by
- [wp-client.ts](wp-client.ts.md) (`processContent`, `parseContentBlocks`, `toFullSizeUrl` during `WpPost → ApiArticle` conversion)
- Re-exported from the package barrel [index.ts](index.ts.md)

## Notes
- Pure functions, no IO — the only module in `packages/api` with no fetch calls.
- Regex-based HTML processing: adequate for WP output but not a real HTML parser; unusual nesting could slip through.
- Gallery images are intentionally *not* inlined into the HTML — callers resolve gallery media IDs via `GET /wp/v2/media` (see [wp-client.ts](wp-client.ts.md) `resolveMediaMap`).
- `processContent` and `parseContentBlocks` run over the same post and are both used: the first still produces `images[]` for cards and OG tags, the second produces the article body. Changing `processContent` therefore changes card thumbnails, not the article layout.
- Divi encodes its attribute quotes (`&#8221;`), so `parseContentBlocks` matches `[et_pb_gallery …]` against the raw string — the encoded entities contain no `]`, so bracket matching still works and byte offsets stay valid. Decoding first would shift every position.

---
*Documented at commit e636e60.*
