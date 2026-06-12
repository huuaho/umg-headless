# packages/api/index.ts

**Purpose:** Barrel file — the public entry point of the `@umg/api` package.

## Responsibilities
Re-exports everything from [types.ts](types.ts.md), [client.ts](client.ts.md), [transformers.ts](transformers.ts.md), and [content.ts](content.ts.md), plus the named `useArticles` hook from [hooks/useArticles.ts](hooks/useArticles.ts.md).

## Key exports
- All types (`ApiArticle`, `ArticlesResponse`, `WpComment`, section data types, ...)
- Fetch facade: `fetchArticles`, `searchArticles`, `fetchArticleBySlug`, `fetchAllSlugs`, `fetchComments`, `postComment`
- Transformers: `toSectionData`, `toSectionType3Data`, `toSectionType4Data`, `toFeaturedArticle`, ...
- Content utilities: `processContent`, `stripDiviShortcodes`, `extractGalleryIds`, `toFullSizeUrl`
- `useArticles` hook

## Dependencies
- Internal: [types.ts](types.ts.md), [client.ts](client.ts.md), [transformers.ts](transformers.ts.md), [content.ts](content.ts.md), [hooks/useArticles.ts](hooks/useArticles.ts.md)
- External: none

## Used by
Everything importing `@umg/api`: most of `@umg/ui` ([CategoryContent](../ui/CategoryContent.tsx.md), [SearchContent](../ui/SearchContent.tsx.md), [ResultCard](../ui/ResultCard.tsx.md), [SeenArticlesContext](../ui/SeenArticlesContext.tsx.md), section and article components), [packages/config/dummyData.ts](../config/dummyData.ts.md), and the three Next.js apps (article pages in EM/IS).

## Notes
- [wp-client.ts](wp-client.ts.md) is intentionally *not* re-exported — apps go through the mode-switching facade in [client.ts](client.ts.md).
- `package.json` points `main`/`types` at this file; consumers transpile the raw TS via Next's `transpilePackages`.

---
*Documented at commit 1cbdce5.*
