# packages/api/transformers.ts

**Purpose:** Transforms normalized `ApiArticle` objects into the per-section UI shapes (`SectionData`, `SectionType4Data`) consumed by the homepage section components.

## Responsibilities
- Decodes common HTML entities in titles/excerpts (`&amp;`, smart quotes, dashes, ellipsis).
- Builds the metadata string shown under titles via `formatArticleMeta()` — controlled by the `NEXT_PUBLIC_ARTICLE_META` env var: `"author"` shows the author name, `"readtime"` (default) shows "X min read".
- Picks gallery images: `images[]` array (carousel if 2+), falling back to `featured_image`, then `/placeholder.jpg`.
- `ensureFeaturedHasImage()` reorders an article list so the first article with at least one image becomes the featured slot (no-op if none have images).
- Slices article lists to the count each section layout needs (featured + 4, featured + 3, or 4 equal).

## Key exports
- `toFeaturedArticle(article) -> FeaturedArticle` — title, snippet, meta, gallery, url, optional slug.
- `toSecondaryArticle(article) -> SecondaryArticle` — title, meta, url, optional slug.
- `toType4Article(article, includeImage?) -> Type4Article` — first image only when `includeImage`.
- `toSectionData(articles) -> SectionData` — featured + up to 4 secondary (SectionType1/2).
- `toSectionType3Data(articles) -> SectionData` — featured + up to 3 secondary (SectionType3).
- `toSectionType4Data(articles, textOnly?) -> SectionType4Data` — 4 equal articles, images optional (SectionType4).

## Dependencies
- Internal: [types.ts](types.ts.md) (types only)
- External: none

## Used by
- [../ui/sections/CategorySectionWrapper.tsx](../ui/sections/CategorySectionWrapper.tsx.md) — calls the `toSection*` functions per section type after fetching/dedup.
- Re-exported from the package barrel [index.ts](index.ts.md).

## Notes
- Pure functions; the only environment read is `NEXT_PUBLIC_ARTICLE_META` (evaluated per call, not at module load).
- `slug: article.slug || undefined` propagates the internal/external link distinction — UMG's [client.ts](client.ts.md) blanks slugs in custom mode so all links render externally.

---
*Documented at commit 1cbdce5.*
