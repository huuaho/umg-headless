# packages/api/wp-client.ts

**Purpose:** Standard WP REST API (`wp/v2/*`) implementations that adapt raw WordPress posts into the normalized `ApiArticle` format (used by Echo Media / International Spectrum in "wp" mode).

## Responsibilities
- Fetches posts from `{API_BASE_URL}/wp/v2/posts?_embed` and converts each `WpPost` to `ApiArticle` via `wpPostToApiArticle()`:
  - Featured image from `_embedded["wp:featuredmedia"]`, upgraded to full size via `toFullSizeUrl()`.
  - Author resolution order: PublishPress `authors[0].display_name` → `_embedded.author[0].name` → custom `author_display_name` field → `"Unknown"`.
  - Categories from `_embedded["wp:term"][0]`.
  - Body HTML cleaned through `processContent()` ([content.ts](content.ts.md)) — Divi shortcodes stripped, content images extracted.
  - Divi gallery media IDs resolved to URLs in one batched `GET /wp/v2/media?include=...` request (`resolveMediaIds()`).
  - All images deduplicated into `images[]`; if none exist and the post has a `video_url` meta, falls back to the YouTube `maxresdefault` thumbnail.
  - Excerpt: HTML stripped + WP's auto-generated "Continue reading 'Title'" suffix removed.
  - Read time estimated at ~200 words/min (min 1).
- Resolves category slugs to WP category IDs via `GET /wp/v2/categories?slug=X`, cached in a module-level `Map`.
- Reads pagination totals from `X-WP-Total` / `X-WP-TotalPages` response headers.
- Validates JSON responses (`parseJsonResponse`) — throws with a body snippet if the server returns non-JSON (e.g., an HTML error page).

## Key exports
- `fetchArticlesWP(options) -> Promise<ArticlesResponse>` — paginated posts, optional category filter (empty result if slug unknown).
- `searchArticlesWP(options) -> Promise<ArticlesResponse>` — full-text search via `?search=`; unknown category slug is silently ignored.
- `fetchArticleBySlugWP(slug) -> Promise<ApiArticle | null>` — single post lookup by slug.
- `fetchAllSlugsWP() -> Promise<string[]>` — paginates through all posts (100/page, `_fields=slug`) for static generation; a 400 response is treated as "past last page".
- `fetchCommentsWP(postId) -> Promise<WpComment[]>` — approved comments, oldest first, up to 100.
- `postCommentWP(payload) -> Promise<WpComment>` — submits a comment; surfaces WP's error `message` on failure; returned `status` may be `"hold"` (moderation).

## Dependencies
- Internal: [types.ts](types.ts.md), [content.ts](content.ts.md) (`processContent`, `toFullSizeUrl`)
- External: none (native `fetch`)

## Used by
- [client.ts](client.ts.md) exclusively — apps never import this module directly; the facade delegates here when `NEXT_PUBLIC_API_MODE=wp`.

## Notes
- `API_BASE_URL` comes from `NEXT_PUBLIC_WP_API_URL` (e.g., `https://api.echo-media.info/wp-json`, `https://api.internationalspectrum.org/wp-json`) with a placeholder fallback.
- The category-ID cache is module-scoped and never invalidated — fine for client sessions and build-time use, but renames in WP require a reload.
- Comment moderation behavior and error surfacing are documented in the consumer doc [../ui/article/CommentsSection.tsx.md](../ui/article/CommentsSection.tsx.md).
- See [README.md](README.md) for the custom-vs-wp mode comparison.

---
*Documented at commit 1cbdce5.*
