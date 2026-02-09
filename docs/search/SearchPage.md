# Search Page

## Overview

The Search page (`apps/*/app/search/page.tsx`) provides full-text search across all articles. It displays paginated results with article cards showing thumbnails, metadata, and excerpts. Used by all three apps (UMG, Echo Media, International Spectrum) — each app has its own copy in `app/search/page.tsx`.

## URL Structure

```
/search?search=<query>
```

## Features

### 1. Search Bar
- Large, centered input field with submit button
- Max width: 672px (`max-w-2xl`)
- Auto-focuses on page load
- Updates URL on submit (enables sharing/bookmarking)

### 2. Search Results
- Paginated display (20 results per page)
- Result count: "Showing X-Y of Z results"
- Each result shows:
  - Thumbnail image (responsive: 96x64 mobile, 128x80 desktop)
  - Category and source label
  - Article title (wrapped in `ArticleLink` for internal/external routing)
  - Excerpt (2-line clamp)
  - Author and read time

### 3. Pagination
- Previous/Next buttons
- Current page indicator
- Smooth scroll to top on page change
- Hidden when only 1 page of results

### 4. States

| State | Display |
|-------|---------|
| No query | "Enter a search term to find articles" |
| Loading | Skeleton placeholders (5 items) |
| Error | Error message with retry button |
| No results | "No results found" with suggestions |
| Success | Article cards with pagination |

## Component Structure

```
SearchPage
└── Suspense (fallback: SearchResultsSkeleton)
    └── SearchContent
        ├── SearchBar (auto-focus, max-w-2xl)
        ├── Heading + result count
        ├── [Loading] SearchResultsSkeleton
        ├── [Error] Error message + Retry button
        ├── [No results] Empty state message
        ├── [Results] SearchResultCard list
        │   └── SearchResultCard
        │       ├── Thumbnail (left)
        │       └── Content (right)
        │           ├── Category · Source
        │           ├── Title (ArticleLink)
        │           ├── Excerpt (2 lines)
        │           └── Author · Read time
        └── [Multiple pages] Pagination
```

## API Integration

```typescript
import { searchArticles, type ApiArticle } from "@umg/api";

const response = await searchArticles({
  search: query,
  page: pageNum,
  perPage: 20,
});
```

The `searchArticles()` function delegates to the appropriate backend based on `NEXT_PUBLIC_API_MODE`:
- `custom` (UMG): `GET /um/v1/articles?search=...`
- `wp` (EM/IS): `GET /wp/v2/posts?search=...&_embed`

## Article Links

Search results use `ArticleLink` from `@umg/ui`:
- **EM/IS**: Articles have `slug` → renders `<Link href="/articles/{slug}">` (internal navigation)
- **UMG**: Articles have no slug → renders `<a href={source_url} target="_blank">` (external link)

See [../components/ArticleLink.md](../components/ArticleLink.md) for details.

## Header Integration

When on the search page (`pathname === "/search"`):
- Desktop search icon is hidden
- Desktop expanded search is hidden
- Mobile search bar in menu is hidden

This prevents duplicate search UI.

## Styling Notes

### Container
- Outer: `max-w-325` (1300px) — matches Header
- Inner content: `max-w-3xl` (768px)

### Colors
- Text primary: `#212223`
- Text secondary: `gray-600`
- Text muted: `gray-500`
- Search button: `#8b8b8b` (hover: `#6b6b6b`)

### Thumbnail Sizes

| Breakpoint | Width | Height |
|------------|-------|--------|
| Default | 96px | 64px |
| md (768px+) | 128px | 80px |

## Client Component

Has `"use client"` — uses `useSearchParams`, `useRouter`, `useState`, `useEffect`. Compatible with `output: "export"` (static export).

## Files

| File | Purpose |
|------|---------|
| `apps/echo-media/app/search/page.tsx` | EM search page |
| `apps/international-spectrum/app/search/page.tsx` | IS search page |
| `apps/umg/app/search/page.tsx` | UMG search page |
| `packages/api/client.ts` | `searchArticles()` function |
| `packages/api/types.ts` | `SearchArticlesOptions`, `ApiArticle` types |
| `packages/ui/ArticleLink.tsx` | Smart link component used in search results |
| `packages/ui/Header.tsx` | Hides search icon on search page |
