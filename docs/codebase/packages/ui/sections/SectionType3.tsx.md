# packages/ui/sections/SectionType3.tsx

**Purpose:** Homepage section layout #3 — featured article plus 3 secondary headlines (the 3-secondary variant of type2).

## Responsibilities
- Identical structure and title auto-fit (LG+, 3 → 1.5 rem) to [SectionType2](SectionType2.tsx.md), but renders only 3 secondary cards.
- Responsive: SM stacked; MD secondary in 3 columns; LG featured text (1/3) | image (2/3) with 3 secondary columns below; 2XL 4-column grid (1 text | 2 image | 1 secondary stack).

## Key exports
- `SectionType3(props)` (default) — `SectionData` fields plus `slug`, `category`, category-label styling props, `titleClassName`.

## Dependencies
- Internal: [components/FeaturedMedia.tsx](components/FeaturedMedia.tsx.md), [../ArticleLink.tsx](../ArticleLink.tsx.md), [CategoryLabel.tsx](CategoryLabel.tsx.md), `@umg/api` types ([types.ts](../../api/types.ts.md))
- External: `react`

## Used by
- [CategorySectionWrapper.tsx](CategorySectionWrapper.tsx.md) (`sectionType="type3"`, fed by `toSectionType3Data` which slices to 3 secondary). Exported from the package barrel.

## Notes
- `"use client"`. Near-duplicate of SectionType2 — changes to one usually belong in the other two as well.

---
*Documented at commit 1cbdce5.*
