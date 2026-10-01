# packages/api/wp-client.ts

**Purpose:** Standard WP REST API (`wp/v2/*`) implementations that adapt raw WordPress posts into the normalized `ApiArticle` format (used by Echo Media / International Spectrum in "wp" mode).

## Responsibilities
- Fetches posts from `{API_BASE_URL}/wp/v2/posts?_embed` and converts each `WpPost` to `ApiArticle` via `wpPostToApiArticle()`:
  - Featured image from `_embedded["wp:featuredmedia"]`, upgraded to full size via `toFullSizeUrl()`.
  - Author resolution order: PublishPress `authors[0].display_name` → `_embedded.author[0].name` → custom `author_display_name` field → `"Unknown"`.
  - Categories from `_embedded["wp:term"][0]`.
  - Body HTML cleaned through `processContent()` ([content.ts](content.ts.md)) — Divi shortcodes stripped, content images extracted — and split into ordered blocks by `parseContentBlocks()` for `ApiArticle.blocks`.
  - Divi gallery media IDs resolved to URLs in one batched `GET /wp/v2/media?include=...` request (`resolveMediaMap()`, which returns a `Map<id, url>` so each URL can be mapped back onto the gallery block it came from).
  - `buildContentBlocks()` fills Divi galleries from that map, prepends the featured image as the hero block, and removes it from the body wherever it reappears.
  - All images deduplicated into `images[]`; if none exist and the post has a `video_url` meta, falls back to the YouTube `maxresdefault` thumbnail.
  - Excerpt: HTML stripped + WP's auto-generated "Continue reading 'Title'" suffix removed.
  - Read time estimated at ~200 words/min (min 1).
- Resolves category slugs to WP category IDs via `GET /wp/v2/categories?slug=X`, cached in a module-level `Map`.
- Reads pagination totals from `X-WP-Total` / `X-WP-TotalPages` response headers.
- Validates JSON responses (`parseJsonResponse`) — throws with a body snippet if the server returns non-JSON (e.g., an HTML error page).
- Routes **every GET** through `fetchWpGet()`, a retry wrapper that survives SiteGround's `sgcaptcha` bot protection (see Notes).

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
- **`fetchWpGet()` — bot-challenge retries.** SiteGround's bot protection intermittently answers build-time requests with its `/.well-known/sgcaptcha/` HTML interstitial instead of JSON, which kills a whole static build on the first challenged request (GitHub runner IPs get challenged regularly). ⚠️ The challenge arrives as an **HTTP 200 with an HTML body**, so it is invisible to a status-code check: the helper only treats a response as suspect when it is `ok` *and* its `content-type` isn't `application/json`, then matches the body against `/sgcaptcha|\/\.well-known\//i`. On a match it backs off **1s → 3s → 8s** (4 attempts total) and retries; anything else non-JSON throws with a 200-char body snippet, same as before.
  - It returns the **raw `Response`**, not parsed JSON, so each call site keeps its own status handling — `fetchArticlesWP`/`searchArticlesWP` read the `X-WP-Total*` pagination headers, and `fetchAllSlugsWP` treats a 400 as "past the last page". Non-`ok` responses are returned untouched rather than retried.
  - Only the non-JSON branch consumes the body (`response.text()`), leaving the JSON path's body intact for the caller to read.
  - All 7 GETs go through it (categories, media, posts ×3, all-slugs, comments). ⚠️ `postCommentWP` is the one exception and still uses raw `fetch` on purpose — a POST retry could double-post a comment, which is worse than a failed submit the visitor can retry.
- `API_BASE_URL` comes from `NEXT_PUBLIC_WP_API_URL` (e.g., `https://api.echo-media.info/wp-json`, `https://api.internationalspectrum.org/wp-json`) with a placeholder fallback.
- The category-ID cache is module-scoped and never invalidated — fine for client sessions and build-time use, but renames in WP require a reload.
- The featured image is deduped out of **galleries as well as standalone images**. 44 of 198 live posts repeat it in the body, and a carousel opens on its first slide, so leaving it in place rendered the same photo twice, stacked directly under the hero.
- Video posts suppress the featured-image hero entirely (`hasVideo`), because [ArticleLayout](../ui/article/ArticleLayout.tsx.md) gives the hero slot to the YouTube embed.
- `images[]` is built from `processContent` output and is deliberately independent of `blocks` — cards, category pages, search and OG tags all read `images[]`, so block-layout changes cannot affect them.
- Comment moderation behavior and error surfacing are documented in the consumer doc [../ui/article/CommentsSection.tsx.md](../ui/article/CommentsSection.tsx.md).
- See [README.md](README.md) for the custom-vs-wp mode comparison.

---
*Documented at commit 0c47b38.*
