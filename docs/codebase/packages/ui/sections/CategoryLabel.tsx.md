# packages/ui/sections/CategoryLabel.tsx

**Purpose:** The styled category title shown at the top of every homepage section — supports color, underline, icon, and link variants.

## Responsibilities
- Renders the category name in bold small text, optionally wrapped in a `next/link` to `/category/{slug}` when `slug` is provided.
- Styling knobs: `categoryTextColor` (falls back to `categoryColor`, then black), `categoryUnderlineColor` (3px bottom border), `categoryIcon` (16px img to the left).
- Shows a `" >"` arrow suffix only in the default style (no underline, icon, or text color set).

## Key exports
- `CategoryLabel({ category, slug?, categoryColor?, categoryTextColor?, categoryUnderlineColor?, categoryIcon? })` (default).

## Dependencies
- Internal: none
- External: `next/link`

## Used by
- [SectionType1](SectionType1.tsx.md)–[SectionType4](SectionType4.tsx.md), [SectionSkeleton](SectionSkeleton.tsx.md), [SectionError](SectionError.tsx.md). Internal to the sections folder — not exported from the package barrel.

## Notes
- Server-compatible; purely presentational.
- Skeleton/Error render it without `slug` (unlinked), the real sections link it.

---
*Documented at commit 1cbdce5.*
