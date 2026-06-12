# packages/ui/index.ts

**Purpose:** Barrel file — the public entry point of the `@umg/ui` package.

## Responsibilities
Re-exports every shared component and its prop types so apps import from `@umg/ui` rather than deep paths.

## Key exports
- Layout chrome: [Header](Header.tsx.md) (+ `HeaderProps`, `NavCategory`, `BannerCompany`), [Footer](Footer.tsx.md) (+ `FooterProps`), [NewsletterSignup](NewsletterSignup.tsx.md), [NotFoundPage](NotFoundPage.tsx.md)
- Homepage sections: [CategorySectionWrapper](sections/CategorySectionWrapper.tsx.md) (+ `SectionType`), [SectionType1](sections/SectionType1.tsx.md)–[SectionType4](sections/SectionType4.tsx.md), [SectionSkeleton](sections/SectionSkeleton.tsx.md), [SectionError](sections/SectionError.tsx.md), [FeaturedMedia](sections/components/FeaturedMedia.tsx.md)
- Article page: [ArticleLayout](article/ArticleLayout.tsx.md), [ArticleLink](ArticleLink.tsx.md)
- Listings: [CategoryContent](CategoryContent.tsx.md), [SearchContent](SearchContent.tsx.md), [ResultCard](ResultCard.tsx.md), [ResultsSkeleton](ResultsSkeleton.tsx.md)
- Dedup: [SeenArticlesProvider](SeenArticlesContext.tsx.md)

## Dependencies
- Internal: all component modules listed above
- External: none directly

## Used by
All three apps (`apps/umg`, `apps/echo-media`, `apps/international-spectrum`) — layouts, homepages, category/search pages, article pages, and not-found pages.

## Notes
- Not exported: [sections/CategoryLabel.tsx](sections/CategoryLabel.tsx.md) (internal to sections), [article/CommentsSection.tsx](article/CommentsSection.tsx.md) and [article/MoreArticles.tsx](article/MoreArticles.tsx.md) (rendered only via ArticleLayout), and `useSeenArticles` (internal hook).
- `package.json` points `main`/`types` here; apps transpile via `transpilePackages`.

---
*Documented at commit 1cbdce5.*
