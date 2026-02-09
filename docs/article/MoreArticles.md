# MoreArticles Component

## Overview

The MoreArticles component (`packages/ui/article/MoreArticles.tsx`) renders a horizontal-scroll carousel of related and recent articles below the comments section on article detail pages. Used by Echo Media and International Spectrum. UMG is unaffected (`currentSlug` prop is optional on ArticleLayout).

## Purpose

Encourages further reading by displaying 10 article cards — alternating between same-category and recent articles — fetched client-side from the WP REST API.

## Props

```typescript
interface MoreArticlesProps {
  currentSlug: string;  // Slug of the current article (excluded from results)
  category: string;     // Category name of the current article
}
```

## Layout

```
┌──────────────────────────────────────────────┐
│  [Header]                                    │
│                                              │
│  [Article Content]                           │
│                                              │
│  [Comments Section]                          │
│                                              │
│  ─────────────── border-t ───────────────    │
│                                              │
│  More Articles                      [< >]    │
│                                              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌───···   │
│  │ image  │ │ image  │ │ image  │ │         │
│  │        │ │        │ │        │ │         │
│  │CATEGORY│ │CATEGORY│ │CATEGORY│ │         │
│  │Title   │ │Title   │ │Title   │ │         │
│  │Jan 2025│ │Feb 2025│ │Mar 2025│ │         │
│  └────────┘ └────────┘ └────────┘ └───···   │
│            ← scrollable →                    │
│                                              │
│  [Footer]                                    │
└──────────────────────────────────────────────┘
```

## Data Fetching

Client-side (`"use client"`, `useEffect` on mount). Two parallel API calls:

1. `fetchArticles({ category, perPage: 6 })` — same-category articles (+1 to account for current)
2. `fetchArticles({ perPage: 16 })` — recent articles across all categories (+extra for dedup)

### Merge Algorithm

1. Remove current article (by slug) from both lists
2. Take first 5 from category list → `categoryArticles`
3. From recent list, remove any slugs already in category pick → `recentArticles`
4. If category has fewer than 5, backfill remaining slots from recent
5. Interleave: `[cat[0], rec[0], cat[1], rec[1], ...]`
6. Trim to 10

### API Change

`FetchArticlesOptions.category` was made optional to support fetching recent articles without a category filter. When omitted, `/wp/v2/posts` returns posts across all categories sorted by date descending.

## Navigation

- **Desktop**: Left/right arrow buttons in the heading row. Scroll one card per click with smooth animation. Buttons auto-disable at scroll boundaries.
- **Mobile**: Native horizontal swipe (CSS `overflow-x-auto` with `snap-x snap-mandatory`).
- **Scroll snap**: Each card has `snap-start` for crisp stopping points.

## Card Design

Each card:
- Fixed width: `w-64` (mobile) / `w-72` (md+), `flex-shrink-0`
- Featured image: `aspect-3/2 object-cover rounded` (placeholder if no image)
- Category label: `text-xs font-semibold text-gray-500 uppercase tracking-wide`
- Title: `text-sm font-semibold leading-snug line-clamp-2` (2-line clamp)
- Date: `text-xs text-gray-400` (format: "Jan 15, 2025")
- Entire card wrapped in `ArticleLink` for internal routing

## States

| State | Display |
|-------|---------|
| Loading | 3 skeleton cards (pulsing gray rectangles) |
| Error | Error message with "Retry" link (reloads page) |
| Empty | Section not rendered at all |
| Loaded | Horizontal scroll carousel with arrow buttons |

## Styling

| Element | Classes |
|---------|---------|
| Section | `pt-8 pb-12 border-t border-gray-200` |
| Heading row | `flex items-center justify-between mb-4` |
| Heading | `text-xl font-bold` |
| Arrow buttons | `p-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30` |
| Scroll container | `flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4` |
| Card | `w-64 md:w-72 flex-shrink-0 snap-start hover:opacity-80 transition-opacity` |
| Image | `w-full aspect-3/2 object-cover rounded bg-gray-100` |
| Category | `text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2` |
| Title | `text-sm font-semibold leading-snug line-clamp-2 mt-1 text-gray-900` |
| Date | `text-xs text-gray-400 mt-1` |

## Usage

Rendered automatically by ArticleLayout when `currentSlug` and `category` are provided:

```tsx
// Inside ArticleLayout
{currentSlug && category && (
  <MoreArticles currentSlug={currentSlug} category={category} />
)}
```

Each app's article page passes the slug:

```tsx
// apps/echo-media/app/articles/[slug]/page.tsx
// apps/international-spectrum/app/articles/[slug]/page.tsx
<ArticleLayout
  ...
  currentSlug={article.slug}
/>
```

## Static Export Behavior

Fully client-side — fetches on mount via browser. Compatible with `output: "export"`.

## Files

| File | Purpose |
|------|---------|
| `packages/ui/article/MoreArticles.tsx` | This component |
| `packages/ui/article/ArticleLayout.tsx` | Parent — renders MoreArticles when `currentSlug` is set |
| `packages/ui/ArticleLink.tsx` | Card link wrapper (internal routing) |
| `packages/api/types.ts` | `FetchArticlesOptions` (category now optional) |
| `packages/api/client.ts` | `fetchArticles()` (supports optional category) |
| `packages/api/wp-client.ts` | `fetchArticlesWP()` (supports optional category) |
| `apps/echo-media/app/articles/[slug]/page.tsx` | Passes `currentSlug` |
| `apps/international-spectrum/app/articles/[slug]/page.tsx` | Passes `currentSlug` |
