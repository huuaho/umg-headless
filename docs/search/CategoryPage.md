# Category Page

## Overview

Each app has a dedicated category page at `/category/[slug]` that displays a paginated listing of all articles in a single category. The per-app page is a thin wrapper that imports the shared `CategoryContent` component from `@umg/ui` (`packages/ui/CategoryContent.tsx`).

## URL Structure

```
/category/{slug}
```

For example: `/category/artculture`, `/category/world-news-politics`

## Props

```typescript
interface CategoryContentProps {
  slug: string;           // Category slug for API query
  categoryName: string;   // Display name for page heading
  externalOnly?: boolean; // When true, links use <a target="_blank"> (UMG)
}
```

## Features

- 20 articles per page
- Pagination with Previous/Next buttons
- Result count: "Showing X-Y of Z articles"
- Instant scroll to top on page change
- Error state with retry button
- Empty state: "No articles found in this category"
- Uses shared `ResultCard` and `ResultsSkeleton` components (same as search)

## Component Structure

```
CategoryPage (per-app, thin wrapper)
└── CategoryContent (packages/ui/CategoryContent.tsx)
    ├── Heading (category name)
    ├── [Loading] ResultsSkeleton
    ├── [Error] Error message + Retry button
    ├── [No results] Empty state message
    ├── [Results] ResultCard list + result count
    │   └── ResultCard (packages/ui/ResultCard.tsx)
    └── [Multiple pages] Pagination
```

## Static Generation

Category pages are statically generated at build time:

```typescript
export function generateStaticParams() {
  return categories.map((cat) => ({ slug: cat.slug }));
}

export const dynamicParams = false;
```

Categories are defined in each app's `lib/categories.ts`.

## Per-App Behavior

- **UMG**: Passes `externalOnly` — article links open in a new tab (`<a target="_blank">`)
- **EM/IS**: No `externalOnly` — articles route internally via `ArticleLink` to `/articles/[slug]`

## Connection to CategoryLabel

The `CategoryLabel` component (used in homepage section headers) includes a `slug` prop that wraps the label text in a `<Link href="/category/{slug}">`. This makes section headings on the home page link directly to these category pages.

## Files

| File | Purpose |
|------|---------|
| `apps/umg/app/category/[slug]/page.tsx` | UMG category page |
| `apps/echo-media/app/category/[slug]/page.tsx` | EM category page |
| `apps/international-spectrum/app/category/[slug]/page.tsx` | IS category page |
| `packages/ui/CategoryContent.tsx` | Shared category content component |
| `packages/ui/ResultCard.tsx` | Result card (shared with search) |
| `packages/ui/ResultsSkeleton.tsx` | Loading skeleton (shared with search) |
| `apps/*/lib/categories.ts` | Category definitions (slug, name, color) |
