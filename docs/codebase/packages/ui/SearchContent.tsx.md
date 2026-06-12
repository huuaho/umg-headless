# packages/ui/SearchContent.tsx

**Purpose:** Client-side search page body — search bar plus paginated results (20 per page) driven by the `?search=` query param.

## Responsibilities
- Wraps the inner UI in `<Suspense>` (required because `useSearchParams` suspends during prerender).
- `SearchBar` (internal): controlled input that pushes `/search?search={query}` on submit; pre-filled from the current query.
- `SearchInner` (internal): reads `search` from the URL, calls `searchArticles({ search, page, perPage: 20 })` whenever the query changes (resetting to page 1), and renders result count, [ResultsSkeleton](ResultsSkeleton.tsx.md), error block with Retry, no-results message, [ResultCard](ResultCard.tsx.md) list, and Previous/Next pagination.
- Passes `externalOnly` through to ResultCard.

## Key exports
- `SearchContent({ externalOnly? })` (default).

## Dependencies
- Internal: `@umg/api` ([client](../api/client.ts.md) `searchArticles`, [types](../api/types.ts.md)), [ResultCard.tsx](ResultCard.tsx.md), [ResultsSkeleton.tsx](ResultsSkeleton.tsx.md)
- External: `react`, `next/navigation` (`useSearchParams`, `useRouter`)

## Used by
- All three apps' `app/search/page.tsx` (UMG passes `externalOnly`). The [Header](Header.tsx.md) search forms route here.

## Notes
- `"use client"`; the URL is the single source of truth for the query — submitting just navigates, and the effect refetches.
- In custom mode the search hits `um/v1/articles?search=`; in wp mode `wp/v2/posts?search=` (see [@umg/api](../api/README.md)).

---
*Documented at commit 1cbdce5.*
