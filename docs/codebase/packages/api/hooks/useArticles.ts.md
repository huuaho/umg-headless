# packages/api/hooks/useArticles.ts

**Purpose:** Client-side React hook that fetches articles for a category with loading/error state and a refetch function.

## Responsibilities
- Wraps `fetchArticles()` from [client.ts](../client.ts.md) in `useState`/`useEffect`/`useCallback`.
- Fetches on mount and whenever `category` or `count` changes.
- Normalizes thrown values into `Error` instances.

## Key exports
- `useArticles({ category, count = 5 }) -> { articles, isLoading, error, refetch }` — `articles` is `ApiArticle[]` (the response `items`; pagination metadata is discarded).

## Dependencies
- Internal: [../client.ts](../client.ts.md) (`fetchArticles`), [../types.ts](../types.ts.md) (types)
- External: `react` (peer dependency)

## Used by
- [../../ui/sections/CategorySectionWrapper.tsx](../../ui/sections/CategorySectionWrapper.tsx.md) — the homepage section orchestrator (its only consumer in the repo).
- Re-exported from the package barrel [../index.ts](../index.ts.md).

## Notes
- `"use client"` module — client components only.
- No caching, debouncing, or request cancellation: a stale response from a rapid category change could briefly win (acceptable here since `category` props are static per section).
- Always page 1; pagination is handled separately by [CategoryContent](../../ui/CategoryContent.tsx.md) / [SearchContent](../../ui/SearchContent.tsx.md), which call the client directly instead.

---
*Documented at commit 1cbdce5.*
