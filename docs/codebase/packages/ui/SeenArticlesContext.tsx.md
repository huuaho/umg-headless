# packages/ui/SeenArticlesContext.tsx

**Purpose:** React context that deduplicates articles across homepage sections — higher-priority sections "claim" article IDs so lower-priority sections skip them.

## Responsibilities
- `SeenArticlesProvider` keeps a mutable `Map<articleId, priority>` in a ref plus a `version` counter in state.
- `claim(ids, priority)`: records IDs at the given priority, keeping the *lowest* (most important) priority per ID; bumps `version` only when something changed, triggering re-filters in consumers.
- `filter(articles, priority)`: returns the articles that are unclaimed or claimed at an equal/lower-importance (numerically >=) priority — i.e., a section keeps articles unless a strictly more important section claimed them.
- `useSeenArticles()` returns the context value or `null` when no provider is mounted (dedup is opt-in).

## Key exports
- `SeenArticlesProvider({ children })` — wrap the homepage to enable cross-section dedup.
- `useSeenArticles() -> { claim, filter, version } | null`.

## Dependencies
- Internal: `@umg/api` types ([types.ts](../api/types.ts.md))
- External: `react`

## Used by
- [sections/CategorySectionWrapper.tsx](sections/CategorySectionWrapper.tsx.md) — claims rendered article IDs and filters out ones claimed by higher-priority sections.
- Apps wrap their homepage (`app/page.tsx`) in the provider when using section `priority` props.

## Notes
- `"use client"`; claims live in a ref so claiming doesn't itself re-render the provider — `version` is the explicit invalidation signal consumed via `useMemo` deps.
- Lower `priority` number = more important (claims win). Sections without a `priority` prop bypass dedup entirely.

---
*Documented at commit 1cbdce5.*
