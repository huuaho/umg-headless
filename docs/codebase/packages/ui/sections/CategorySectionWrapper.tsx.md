# packages/ui/sections/CategorySectionWrapper.tsx

**Purpose:** Smart orchestrator for homepage category sections — fetches articles, handles loading/error states, deduplicates across sections, transforms data, and renders the chosen section layout.

## Responsibilities
- Fetches articles for `slug` via the [useArticles](../../api/hooks/useArticles.ts.md) hook; the count needed depends on `sectionType` (type1/2: 5, type3/4/4-text: 4). When a dedup `priority` is set, fetches 2x up front to survive filtering.
- Cross-section dedup (opt-in via `priority` + a mounted [SeenArticlesProvider](../SeenArticlesContext.tsx.md)): filters out articles claimed by more important sections, claims the ones it actually renders, and incrementally raises its fetch count if dedup leaves it short (as long as the category still has more).
- Renders [SectionSkeleton](SectionSkeleton.tsx.md) on initial load, [SectionError](SectionError.tsx.md) with retry on error/empty, `null` if dedup consumed everything, otherwise transforms via `toSectionData` / `toSectionType3Data` / `toSectionType4Data` ([transformers](../../api/transformers.ts.md)) and renders [SectionType1](SectionType1.tsx.md)–[4](SectionType4.tsx.md).
- Passes all category-label styling props (`categoryColor`, `categoryTextColor`, `categoryUnderlineColor`, `categoryIcon`) and `titleClassName` through to the section/skeleton/error components.

## Key exports
- `CategorySectionWrapper({ slug, category, sectionType, categoryColor?, categoryTextColor?, categoryUnderlineColor?, categoryIcon?, titleClassName?, priority? })` (default).
- `SectionType` — `"type1" | "type2" | "type3" | "type4" | "type4-text"`.

## Dependencies
- Internal: `@umg/api` ([useArticles](../../api/hooks/useArticles.ts.md), [transformers](../../api/transformers.ts.md)), [SectionType1](SectionType1.tsx.md)–[SectionType4](SectionType4.tsx.md), [SectionSkeleton](SectionSkeleton.tsx.md), [SectionError](SectionError.tsx.md), [../SeenArticlesContext.tsx](../SeenArticlesContext.tsx.md)
- External: `react`

## Used by
- All three apps' homepage `app/page.tsx` — one wrapper per category section, configured from each app's category list.

## Notes
- `"use client"`; data flows API → hook → dedup filter → transformer → presentational section.
- Lower `priority` = claims articles first; sections without `priority` skip dedup and only fetch the exact count needed.
- Skeleton shows only when there are zero articles yet, so dedup backfill refetches don't flash loading states.

---
*Documented at commit 1cbdce5.*
