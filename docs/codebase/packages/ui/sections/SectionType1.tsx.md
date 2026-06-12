# packages/ui/sections/SectionType1.tsx

**Purpose:** Homepage section layout #1 — large featured article (with gallery) plus 4 secondary headlines; the "hero" section style.

## Responsibilities
- Renders the section shell (`id={slug}`, `scroll-mt-24` for hash navigation) with a linked [CategoryLabel](CategoryLabel.tsx.md).
- Featured article: auto-sizing title (see Notes), snippet, meta line, and [FeaturedMedia](components/FeaturedMedia.tsx.md) gallery/single image; links via [ArticleLink](../ArticleLink.tsx.md).
- 4 secondary headline cards (title + meta).
- Responsive: stacked on SM/MD; LG = 2/3 featured | 1/3 secondary; 2XL = featured text (1/3) beside gallery (2/3), secondary in 4 columns below.
- Title auto-fit at 2XL only: tries font sizes 3 / 2.25 / 1.875 / 1.5 rem from largest down until the text column is no taller than the gallery, using `useLayoutEffect` + `requestAnimationFrame`, a `ResizeObserver` on the gallery, and a window resize listener.

## Key exports
- `SectionType1(props)` (default) — `SectionData` fields (`featured`, `secondary`) plus `slug`, `category`, category-label styling props, and `titleClassName`.

## Dependencies
- Internal: [components/FeaturedMedia.tsx](components/FeaturedMedia.tsx.md), [../ArticleLink.tsx](../ArticleLink.tsx.md), [CategoryLabel.tsx](CategoryLabel.tsx.md), `@umg/api` types ([types.ts](../../api/types.ts.md))
- External: `react`

## Used by
- [CategorySectionWrapper.tsx](CategorySectionWrapper.tsx.md) (`sectionType="type1"`, fed by `toSectionData`). Also exported from the package barrel for direct use.

## Notes
- `"use client"`; the title-fitting code mutates `titleRef.style.fontSize` during measurement, then commits via state.
- Secondary slots render conditionally — fewer than 4 articles degrade gracefully.

---
*Documented at commit 1cbdce5.*
