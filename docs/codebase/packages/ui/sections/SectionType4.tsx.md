# packages/ui/sections/SectionType4.tsx

**Purpose:** Homepage section layout #4 — four equal-weight article cards, with image or text-only variants (no featured article).

## Responsibilities
- Renders the section shell with a linked [CategoryLabel](CategoryLabel.tsx.md) and 4 `ArticleCard`s: SM stacked rows, MD 2x2 grid, LG 4 columns.
- With images (`textOnly={false}`): image takes 1/3 width beside text on SM/MD, full-width above text on LG. `next/image` with `fill` over a black box, portrait detection (`object-contain`), and hide-on-error.
- Text-only variant skips images entirely.
- Per-card border/padding logic varies by index and breakpoint so column dividers line up.

## Key exports
- `SectionType4({ slug, category, articles, textOnly?, ...labelProps, titleClassName? })` (default) — `articles` is `Type4Article[]`.

## Dependencies
- Internal: [../ArticleLink.tsx](../ArticleLink.tsx.md), [CategoryLabel.tsx](CategoryLabel.tsx.md), `@umg/api` types ([types.ts](../../api/types.ts.md))
- External: `react`, `next/image`

## Used by
- [CategorySectionWrapper.tsx](CategorySectionWrapper.tsx.md) for both `sectionType="type4"` and `"type4-text"` (fed by `toSectionType4Data(articles, textOnly)`). Exported from the package barrel.

## Notes
- `"use client"`. The only section type without FeaturedMedia or title auto-fit.

---
*Documented at commit 1cbdce5.*
