# packages/ui/ResultCard.tsx

**Purpose:** Horizontal list-item card for search/category results — thumbnail, category/source labels, linked title, excerpt, author, and read time.

## Responsibilities
- Shows the first available image (`images[0]` or `featured_image`) in a fixed-size `next/image` thumbnail on a black background; detects portrait images on load and switches to `object-contain`; hides the image on load error.
- Title links via [ArticleLink](ArticleLink.tsx.md), or as a forced external `target="_blank"` anchor when `externalOnly` is set (UMG).
- Decodes HTML entities in the category name using a DOM `<textarea>` trick.
- Renders excerpt (2-line clamp), author, and "X min read".

## Key exports
- `ResultCard({ article, externalOnly? })` (default) — `article` is an `ApiArticle`.

## Dependencies
- Internal: [ArticleLink.tsx](ArticleLink.tsx.md), `@umg/api` types ([types.ts](../api/types.ts.md))
- External: `react`, `next/image`

## Used by
- [CategoryContent.tsx](CategoryContent.tsx.md) and [SearchContent.tsx](SearchContent.tsx.md).

## Notes
- `"use client"`; the entity decoder relies on `document`, so this component is browser-only.
- Remote image hosts must be whitelisted in each app's `next.config.ts` `images.remotePatterns`.

---
*Documented at commit 1cbdce5.*
