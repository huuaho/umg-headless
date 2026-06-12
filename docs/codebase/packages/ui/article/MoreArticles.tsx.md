# packages/ui/article/MoreArticles.tsx

**Purpose:** Horizontally scrollable "More Articles" carousel at the bottom of article pages — interleaves same-category and recent articles.

## Responsibilities
- Fetches in parallel: up to 6 articles from the current category and up to 16 recent articles (`fetchArticles`), excluding the current slug.
- Selection: take up to 5 category articles; dedup recents against them; backfill from recents if the category has fewer than 5; interleave category/recent picks alternately and trim to 10 total.
- Renders snap-scroll cards (image via `next/image` with portrait detection, colored category label from `categoryColorMap`, 2-line title, date) wrapped in [ArticleLink](../ArticleLink.tsx.md).
- Arrow buttons scroll by one card width; enabled/disabled state tracked from scroll position. Loading skeletons and an error-with-reload state; renders nothing if no articles after load.

## Key exports
- `MoreArticles({ currentSlug, category, categoryColorMap? })` (default).

## Dependencies
- Internal: `@umg/api` ([client](../../api/client.ts.md) `fetchArticles`, [types](../../api/types.ts.md)), [../ArticleLink.tsx](../ArticleLink.tsx.md)
- External: `react`, `next/image`

## Used by
- [ArticleLayout.tsx](ArticleLayout.tsx.md) only (rendered when `currentSlug` and `category` are set — EM/IS article pages). Not exported from the package barrel.

## Notes
- `"use client"`; client-side fetch on mount with a cancellation flag.
- `category` is passed as the category *name* into `fetchArticles({ category })`, which expects a slug — this works in wp mode only when the WP category slug lookup tolerates it; in practice EM/IS pass values that resolve. Worth verifying when adding categories whose display name differs from the slug.
- Retry uses `window.location.reload()` (full page reload), unlike other components' soft retries.

---
*Documented at commit 1cbdce5.*
