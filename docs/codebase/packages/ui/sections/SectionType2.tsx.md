# packages/ui/sections/SectionType2.tsx

**Purpose:** Homepage section layout #2 — featured article with image plus 4 secondary headlines, arranged as a 4-column grid at 2XL.

## Responsibilities
- Same building blocks as [SectionType1](SectionType1.tsx.md): linked [CategoryLabel](CategoryLabel.tsx.md), featured title/snippet/meta + [FeaturedMedia](components/FeaturedMedia.tsx.md), 4 secondary cards, all linked via [ArticleLink](../ArticleLink.tsx.md).
- Responsive: SM/MD stacked; LG = featured text (1/3) | image (2/3), secondary in 4 columns below; 2XL = single 4-column grid (1 col text | 2 cols image | 1 col secondary stack) using `2xl:contents`.
- Title auto-fit kicks in at LG+ (not just 2XL like type1): same iterate-down algorithm (3 → 1.5 rem) with `ResizeObserver` + resize listener.

## Key exports
- `SectionType2(props)` (default) — `SectionData` fields plus `slug`, `category`, category-label styling props, `titleClassName`.

## Dependencies
- Internal: [components/FeaturedMedia.tsx](components/FeaturedMedia.tsx.md), [../ArticleLink.tsx](../ArticleLink.tsx.md), [CategoryLabel.tsx](CategoryLabel.tsx.md), `@umg/api` types ([types.ts](../../api/types.ts.md))
- External: `react`

## Used by
- [CategorySectionWrapper.tsx](CategorySectionWrapper.tsx.md) (`sectionType="type2"`, fed by `toSectionData`). Exported from the package barrel.

## Notes
- `"use client"`. Structurally a sibling of type1 with the secondary column moved into the 2XL grid; the duplicated title-fit logic is copy-pasted across types 1–3.

---
*Documented at commit 1cbdce5.*
