# apps/echo-media/app/articles/[slug]/page.tsx

**Purpose:** Article detail route — statically generates one page per WordPress post and renders it with the shared `ArticleLayout`.

## Responsibilities
At build time, `generateStaticParams` pulls every post slug via `fetchAllSlugs()` and pre-renders each `/articles/<slug>/` page (`dynamicParams = false`, so unknown slugs 404 rather than render on demand). `generateMetadata` fetches the article and builds the page title (`<title> | Echo Media`), description, and Open Graph / Twitter card tags, preferring `featured_image` then the first gallery image. The page component fetches the article again by slug, calls `notFound()` if missing, builds a `categoryColorMap` (name → hex) from the local category list, and hands everything to `ArticleLayout`.

## Key exports
- `dynamicParams = false` — unknown slugs return 404; required for `output: "export"`.
- `generateStaticParams() -> {slug}[]` — all post slugs from the WP API.
- `generateMetadata({params}) -> Metadata` — per-article SEO/OG/Twitter metadata.
- `ArticlePage({params}) -> JSX` — default export; renders `ArticleLayout`.

## Dependencies
- Internal: [lib/categories.ts](../../../lib/categories.ts.md) (`categories`), [@umg/api](../../../../../packages/api/client.ts.md) (`fetchArticleBySlug`, `fetchAllSlugs`), [@umg/ui ArticleLayout](../../../../../packages/ui/article/ArticleLayout.tsx.md)
- External: `next/navigation` (`notFound`)

## Used by
Next.js App Router — the `/articles/[slug]` route. Article cards in homepage sections, category pages, and search results all link here.

## Notes
- Server component; fetches at build time from the WP backend (`NEXT_PUBLIC_WP_API_URL`, default `api.unitedmediadc.com`) — the article is fetched twice per page (metadata + page), relying on fetch caching.
- Passes `postId` and `currentSlug` to `ArticleLayout`, which enables the comments section and the "More Articles" carousel (see `docs/article/*.md`).
- All Echo Media categories share the same color (`#0281b3`), so `categoryColorMap` is effectively uniform here.
- **Difference vs international-spectrum:** IS additionally passes `videoUrl={article.video_url}` to `ArticleLayout` (YouTube embed for its "Video Interviews" category). Echo Media omits that prop; otherwise the files are identical apart from the "| Echo Media" title suffix.

---
*Documented at commit 1cbdce5.*
