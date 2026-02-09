# CategorySectionWrapper Component

## Overview

The CategorySectionWrapper (`packages/ui/sections/CategorySectionWrapper.tsx`) is the main orchestration component that connects API data fetching to section rendering on the homepage. It handles loading states, error states, data transformation, and renders the appropriate section type.

## Purpose

This component acts as a "smart" wrapper that:
1. Fetches articles from the API via the `useArticles` hook
2. Displays loading skeleton while fetching
3. Displays error state with retry functionality if fetch fails
4. Transforms API data into the format each section type expects
5. Renders the correct section component based on `sectionType` prop

## Props

```typescript
interface CategorySectionWrapperProps {
  slug: string;              // Category slug for API query and section ID
  category: string;          // Display name for the category label
  sectionType: SectionType;  // Which section layout to render
  categoryColor?: string;    // Hex color for the category title label (e.g., "#0281b3")
}

type SectionType = "type1" | "type2" | "type3" | "type4" | "type4-text";
```

The `categoryColor` prop is passed through to `SectionType1-4`, `SectionSkeleton`, and `SectionError` to color the category title. When not provided, category titles default to black.

## Section Types

| Type | Component | Articles | Description |
|------|-----------|----------|-------------|
| `type1` | SectionType1 | 5 | Featured article with gallery + 4 secondary |
| `type2` | SectionType2 | 5 | Featured article with single image + 4 secondary |
| `type3` | SectionType3 | 4 | Featured article with single image + 3 secondary |
| `type4` | SectionType4 | 4 | 4 equal articles with images |
| `type4-text` | SectionType4 | 4 | 4 equal articles, text only |

## Data Flow

```
CategorySectionWrapper
  │
  1. useArticles({ category: slug, count: N })
  │
  ├── isLoading → <SectionSkeleton />
  ├── error or empty → <SectionError onRetry={refetch} />
  │
  2. Transform data with appropriate transformer
  │   - toSectionData() for type1, type2
  │   - toSectionType3Data() for type3
  │   - toSectionType4Data() for type4, type4-text
  │
  3. Render <SectionTypeN {...transformedData} />
```

## Articles Per Section Type

```typescript
const ARTICLES_NEEDED: Record<SectionType, number> = {
  type1: 5,      // 1 featured + 4 secondary
  type2: 5,      // 1 featured + 4 secondary
  type3: 4,      // 1 featured + 3 secondary
  type4: 4,      // 4 equal articles
  "type4-text": 4,  // 4 equal articles (no images)
};
```

## State Handling

| State | Display |
|-------|---------|
| Loading | `SectionSkeleton` with category label and animated placeholder |
| Error / Empty | `SectionError` with category label, error message, "Try Again" button |
| Success | Appropriate section component with transformed data |

## Data Transformers

All transformers are in `packages/api/transformers.ts`:

| Transformer | Used By | Output |
|-------------|---------|--------|
| `toSectionData(articles)` | type1, type2 | `{ featured, secondary[] }` |
| `toSectionType3Data(articles)` | type3 | `{ featured, secondary[] }` (3 items) |
| `toSectionType4Data(articles, textOnly)` | type4, type4-text | `{ articles[] }` |

## Usage

```tsx
// apps/echo-media/app/page.tsx
import { CategorySectionWrapper } from "@umg/ui";

export default function HomePage() {
  return (
    <main>
      <CategorySectionWrapper
        slug="artculture"
        category="Art & Culture"
        sectionType="type1"
        categoryColor="#0281b3"
      />
      <CategorySectionWrapper
        slug="education"
        category="Education"
        sectionType="type2"
        categoryColor="#0281b3"
      />
      <CategorySectionWrapper
        slug="environment"
        category="Environment"
        sectionType="type3"
        categoryColor="#0281b3"
      />
    </main>
  );
}
```

## Client Component

Has `"use client"` — uses the `useArticles` hook for client-side data fetching. Compatible with `output: "export"` (static export).

## Dependencies

- `@umg/api` — `useArticles` hook, `toSectionData`, `toSectionType3Data`, `toSectionType4Data` transformers
- `packages/ui/sections/SectionType1-4` — Section layout components
- `packages/ui/sections/SectionSkeleton` — Loading state component
- `packages/ui/sections/SectionError` — Error state component

## Files

| File | Purpose |
|------|---------|
| `packages/ui/sections/CategorySectionWrapper.tsx` | This component |
| `packages/api/hooks/useArticles.ts` | Data fetching hook |
| `packages/api/transformers.ts` | API to component data transformers |
| `packages/ui/sections/SectionSkeleton.tsx` | Loading state |
| `packages/ui/sections/SectionError.tsx` | Error state |
| `packages/ui/sections/SectionType1.tsx` | Section layout |
| `packages/ui/sections/SectionType2.tsx` | Section layout |
| `packages/ui/sections/SectionType3.tsx` | Section layout |
| `packages/ui/sections/SectionType4.tsx` | Section layout |
