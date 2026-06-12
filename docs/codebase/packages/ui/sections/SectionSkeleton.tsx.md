# packages/ui/sections/SectionSkeleton.tsx

**Purpose:** Pulsing placeholder shown while a homepage section's articles load — real category label, gray bars for content.

## Responsibilities
Renders the section shell (`id={slug}`, same borders/spacing as real sections) with a live [CategoryLabel](CategoryLabel.tsx.md) and an `animate-pulse` layout approximating featured (2/3) + 4 secondary (1/3) slots.

## Key exports
- `SectionSkeleton({ slug, category, categoryColor?, categoryTextColor?, categoryUnderlineColor?, categoryIcon? })` (default).

## Dependencies
- Internal: [CategoryLabel.tsx](CategoryLabel.tsx.md)
- External: none

## Used by
- [CategorySectionWrapper.tsx](CategorySectionWrapper.tsx.md) during initial load. Exported from the package barrel.

## Notes
- Keeps `id={slug}` so header hash navigation works even while loading.
- One generic skeleton for all section types.

---
*Documented at commit 1cbdce5.*
