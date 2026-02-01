# Search Page Documentation

## Overview

The Search page (`app/search/page.tsx`) provides full-text search functionality across all articles. It displays paginated results with article cards showing thumbnails, metadata, and excerpts.

## URL Structure

```
/search?search=<query>
```

- Query parameter: `search` - The search term
- Example: `/search?search=diplomacy`

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
  - Article title (links to source)
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
        ├── SearchBar
        │   ├── Input (h-12, auto-focus)
        │   └── Submit button (search icon)
        │
        ├── Heading ("Search results for X" or "Search")
        ├── Result count ("Showing X-Y of Z")
        │
        ├── [Loading] SearchResultsSkeleton
        ├── [Error] Error message + Retry button
        ├── [No results] Empty state message
        │
        ├── [Results] Article list
        │   └── SearchResultCard (per article)
        │       ├── Thumbnail (left)
        │       └── Content (right)
        │           ├── Category · Source
        │           ├── Title (link)
        │           ├── Excerpt (2 lines)
        │           └── Author · Read time
        │
        └── [Multiple pages] Pagination
            ├── Previous button
            ├── "Page X of Y"
            └── Next button
```

## API Integration

### Endpoint
```
GET /um/v1/articles?search=<query>&per_page=20&page=<page>
```

### Function
```typescript
import { searchArticles } from "@/lib/api";

const response = await searchArticles({
  search: query,      // Search term
  page: pageNum,      // Page number (default: 1)
  perPage: 20,        // Results per page
  category?: string,  // Optional category filter
});

// Response
{
  items: ApiArticle[],
  total: number,
  total_pages: number,
  page: number,
  per_page: number
}
```

### Article Data Used
```typescript
interface ApiArticle {
  id: number;
  title: string;
  source_url: string;        // Link target
  excerpt: string;           // Truncated preview
  featured_image: string;    // Thumbnail (fallback)
  images: string[];          // Thumbnail (primary: images[0])
  category: string;          // Display label
  source_label: string;      // e.g., "Diplomatic Watch"
  author_name: string;
  read_time_minutes: number;
}
```

## Header Integration

The search page integrates with the Header component:
- Header search icon is **hidden** on `/search` (prevents duplicate search UI)
- Header detects search page via `usePathname() === "/search"`
- Submitting from Header search redirects to `/search?search=<query>`

## Styling Notes

### Container
- Outer: `max-w-325` (1300px) - matches Header
- Inner content: `max-w-3xl` (768px)

### Colors
- Text primary: `#212223`
- Text secondary: `gray-600`
- Text muted: `gray-500`
- Search button: `#8b8b8b` (hover: `#6b6b6b`)
- Error text: `red-600`

### Thumbnail Sizes
| Breakpoint | Width | Height |
|------------|-------|--------|
| Default | 96px | 64px |
| md (768px+) | 128px | 80px |

## Utility Functions

### `decodeHtmlEntities`
Decodes HTML entities (e.g., `&amp;` → `&`) for proper display of category names.

```typescript
function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}
```

## Dependencies

- `next/navigation` - `useSearchParams`, `useRouter`
- `next/image` - Optimized image loading
- `@/lib/api` - `searchArticles`, `ApiArticle` type
- React hooks: `useState`, `useEffect`, `useCallback`, `Suspense`

## Files

| File | Purpose |
|------|---------|
| `app/search/page.tsx` | Search page component |
| `lib/api/client.ts` | `searchArticles()` function |
| `lib/api/types.ts` | `SearchArticlesOptions`, `ApiArticle` types |
| `components/Header.tsx` | Hides search icon on search page |
