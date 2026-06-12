# packages/ui/CategoryContent.tsx

**Purpose:** Client-side category listing page body — paginated list of articles for one category slug (20 per page) with skeleton, error/retry, and empty states.

## Responsibilities
- Fetches via `fetchArticles({ category: slug, perPage: 20, page })` from `@umg/api` on mount and on page change.
- Tracks `results`, `total`, `page`, `totalPages`, loading and error state.
- Renders heading + "Showing X–Y of Z articles" count, a [ResultsSkeleton](ResultsSkeleton.tsx.md) while loading, an error block with Retry, an empty message, or the list of [ResultCard](ResultCard.tsx.md)s with Previous/Next pagination (scrolls to top on page change).
- Passes `externalOnly` through to ResultCard so UMG can force external source links.

## Key exports
- `CategoryContent({ slug, categoryName, externalOnly? })` (default).

## Dependencies
- Internal: `@umg/api` ([client](../api/client.ts.md) `fetchArticles`, [types](../api/types.ts.md)), [ResultCard.tsx](ResultCard.tsx.md), [ResultsSkeleton.tsx](ResultsSkeleton.tsx.md)
- External: `react`

## Used by
- All three apps' `app/category/[slug]/page.tsx` (UMG passes `externalOnly`).

## Notes
- `"use client"`; pagination is offset-based via the API's `total_pages`.

---
*Documented at commit 1cbdce5.*
