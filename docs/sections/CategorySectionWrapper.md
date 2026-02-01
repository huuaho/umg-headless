# CategorySectionWrapper Component

## Overview

The CategorySectionWrapper (`components/sections/CategorySectionWrapper.tsx`) is the main orchestration component that connects API data fetching to section rendering. It handles loading states, error states, data transformation, and renders the appropriate section type.

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
  slug: string;        // Category slug for API query and section ID
  category: string;    // Display name for the category label
  sectionType: SectionType;  // Which section layout to render
}

type SectionType = "type1" | "type2" | "type3" | "type4" | "type4-text";
```

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
┌─────────────────────────────────────────────────────────────────┐
│                    CategorySectionWrapper                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. useArticles({ category: slug, count: N })                   │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │  isLoading?  │──yes──▶ <SectionSkeleton />                   │
│  └──────────────┘                                               │
│         │ no                                                     │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │ error or     │──yes──▶ <SectionError onRetry={refetch} />    │
│  │ no articles? │                                               │
│  └──────────────┘                                               │
│         │ no                                                     │
│         ▼                                                        │
│  2. Transform data with appropriate transformer                  │
│     - toSectionData() for type1, type2                          │
│     - toSectionType3Data() for type3                            │
│     - toSectionType4Data() for type4, type4-text                │
│         │                                                        │
│         ▼                                                        │
│  3. Render <SectionTypeN {...transformedData} />                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Articles Per Section Type

The component fetches only the number of articles needed for each section type:

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

### Loading State
Displays `SectionSkeleton` with category label and animated placeholder content.

### Error State
Displays `SectionError` with:
- Category label
- Error message (or "No articles found" if empty)
- "Try Again" button that calls `refetch()`

### Success State
Transforms data and renders the appropriate section component.

## Data Transformers

The component uses transformers from `@/lib/api/transformers`:

| Transformer | Used By | Output |
|-------------|---------|--------|
| `toSectionData(articles)` | type1, type2 | `{ featured, secondary[] }` |
| `toSectionType3Data(articles)` | type3 | `{ featured, secondary[] }` (3 items) |
| `toSectionType4Data(articles, textOnly)` | type4, type4-text | `{ articles[] }` |

## Usage Example

```tsx
// app/page.tsx
import CategorySectionWrapper from "@/components/sections/CategorySectionWrapper";

export default function HomePage() {
  return (
    <main>
      <CategorySectionWrapper
        slug="world-news-politics"
        category="World News & Politics"
        sectionType="type1"
      />
      <CategorySectionWrapper
        slug="profiles-opinions"
        category="Profiles & Opinions"
        sectionType="type2"
      />
      <CategorySectionWrapper
        slug="economy-business"
        category="Economy & Business"
        sectionType="type3"
      />
      <CategorySectionWrapper
        slug="diplomacy"
        category="Diplomacy"
        sectionType="type4"
      />
      <CategorySectionWrapper
        slug="art-culture"
        category="Art & Culture"
        sectionType="type4-text"
      />
    </main>
  );
}
```

## Dependencies

- `@/hooks/useArticles` - Data fetching hook
- `@/lib/api/transformers` - Data transformation functions
- `./SectionType1` through `./SectionType4` - Section components
- `./SectionSkeleton` - Loading state component
- `./SectionError` - Error state component

## Files

| File | Purpose |
|------|---------|
| `components/sections/CategorySectionWrapper.tsx` | Main wrapper component |
| `hooks/useArticles.ts` | Data fetching hook |
| `lib/api/transformers.ts` | API to component data transformers |
| `components/sections/SectionSkeleton.tsx` | Loading state |
| `components/sections/SectionError.tsx` | Error state |
