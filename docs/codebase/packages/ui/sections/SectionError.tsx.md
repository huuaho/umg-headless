# packages/ui/sections/SectionError.tsx

**Purpose:** Error fallback for a homepage section — shows the failure message and a "Try Again" retry button.

## Responsibilities
Renders the section shell (`id={slug}`) with a [CategoryLabel](CategoryLabel.tsx.md) and a centered "Unable to load articles: {message}" plus a button invoking the `onRetry` callback.

## Key exports
- `SectionError({ slug, category, categoryColor?, categoryTextColor?, categoryUnderlineColor?, categoryIcon?, message, onRetry })` (default).

## Dependencies
- Internal: [CategoryLabel.tsx](CategoryLabel.tsx.md)
- External: `react` (click handler)

## Used by
- [CategorySectionWrapper.tsx](CategorySectionWrapper.tsx.md) on fetch error or empty result (`onRetry` = the hook's `refetch`). Exported from the package barrel.

## Notes
- `"use client"`. Also shown for the "category exists but returned 0 articles" case with message "No articles found".

---
*Documented at commit 1cbdce5.*
