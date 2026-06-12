# packages/api/client.ts

**Purpose:** Mode-switching API facade — routes article/comment fetches to either the custom UMG ingestor API or the standard WP REST API.

## Responsibilities
- Reads `NEXT_PUBLIC_API_MODE` (`"custom"` default, or `"wp"`) and `NEXT_PUBLIC_WP_API_URL` at module load.
- In **custom mode** (UMG): calls `GET {API_BASE_URL}/um/v1/articles` (the United Media Ingestor plugin endpoint) with `per_page`, `page`, optional `category` (slug), and optional `search` params.
- In **wp mode** (Echo Media / International Spectrum): delegates every function to its `*WP` counterpart in [wp-client.ts](wp-client.ts.md).
- Post-processes custom-mode responses with `normalizeArticleUrls()`:
  - For articles sourced from headless sites (`echo-media`, `internationalspectrum` via the `SOURCE_FRONTEND` map), rewrites `source_url` to `https://www.{frontend}/articles/{slug}`.
  - Fallback `normalizeSourceUrl()` extracts the slug from WP date permalinks (`/YYYY/MM/DD/slug/`) for articles ingested before the `um_remote_slug` field existed (`HEADLESS_DOMAINS` map).
  - Clears `slug` to `""` on every item so [ArticleLink](../ui/ArticleLink.tsx.md) always renders an external link — UMG has no article detail pages.

## Key exports
- `fetchArticles(options: FetchArticlesOptions) -> Promise<ArticlesResponse>` — paginated article list, optionally filtered by category slug.
- `searchArticles(options: SearchArticlesOptions) -> Promise<ArticlesResponse>` — full-text search (same endpoint with `search` param in custom mode).
- `fetchArticleBySlug(slug) -> Promise<ApiArticle | null>` — single article; **wp mode only**, returns `null` in custom mode.
- `fetchAllSlugs() -> Promise<string[]>` — all slugs for static generation; **wp mode only**, returns `[]` in custom mode.
- `fetchComments(postId) -> Promise<WpComment[]>` — **wp mode only**, returns `[]` in custom mode.
- `postComment(payload) -> Promise<WpComment>` — **wp mode only**, throws in custom mode.

## Dependencies
- Internal: [types.ts](types.ts.md) (types only), [wp-client.ts](wp-client.ts.md) (wp-mode implementations)
- External: none (native `fetch`)

## Used by
- [hooks/useArticles.ts](hooks/useArticles.ts.md)
- `@umg/ui`: [CategoryContent](../ui/CategoryContent.tsx.md), [SearchContent](../ui/SearchContent.tsx.md), [article/MoreArticles](../ui/article/MoreArticles.tsx.md), [article/CommentsSection](../ui/article/CommentsSection.tsx.md)
- Apps: EM/IS `app/articles/[slug]/page.tsx` use `fetchArticleBySlug` / `fetchAllSlugs` (see docs/codebase/apps/)

## Notes
- WP backend lives at `api.unitedmediadc.com` (UMG), `api.echo-media.info` (EM), `api.internationalspectrum.org` (IS) — configured per app via `NEXT_PUBLIC_WP_API_URL` in `.env.local`. Falls back to a placeholder `https://your-wordpress-site.com/wp-json` if unset.
- The `um/v1/articles` endpoint is served by the **United Media Ingestor** WP plugin (source: `docs/plugin/united-media-ingestor/`; docs: [../../plugin/united-media-ingestor/](../../plugin/united-media-ingestor/)).
- Throws plain `Error` with HTTP status text on non-OK responses; no retry logic (retry is handled by UI components).
- See [README.md](README.md) for the full mode comparison.

---
*Documented at commit 1cbdce5.*
