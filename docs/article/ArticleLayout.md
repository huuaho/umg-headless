# ArticleLayout Component

## Overview

The ArticleLayout component (`packages/ui/article/ArticleLayout.tsx`) renders a full article detail page. It is used by both Echo Media and International Spectrum for their `/articles/[slug]` routes. UMG does not use this component (its articles link externally).

## Purpose

Provides a clean, readable article layout with:
- Category label and read time
- Title, author, and formatted date
- Featured image or gallery (via FeaturedMedia)
- Article body HTML rendered with Tailwind Typography (`prose`)

## Props

```typescript
interface ArticleLayoutProps {
  title: string;       // Article title (HTML entities already decoded)
  author: string;      // Author name
  date: string;        // ISO date string (e.g., "2024-03-15T10:30:00")
  category: string;    // Category name (e.g., "Art & Culture")
  readTime: string;    // Pre-formatted (e.g., "3 min read")
  images: string[];    // All images (featured + gallery), deduplicated, full-size URLs
  content: string;     // Sanitized HTML body (Divi shortcodes stripped)
  postId?: number;     // WP post ID — enables CommentsSection (EM/IS only)
  currentSlug?: string; // Current article slug — enables MoreArticles carousel (EM/IS only)
}
```

## Layout

```
┌──────────────────────────────────────────────┐
│  Art & Culture · 3 min read                  │
│                                              │
│  Article Title Here                          │
│  (text-3xl → md:text-4xl → lg:text-5xl)     │
│                                              │
│  By Author Name · March 15, 2024            │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │                                      │    │
│  │   Featured Image / Gallery           │    │
│  │   (FeaturedMedia component)          │    │
│  │                                      │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  Article body content rendered with          │
│  Tailwind prose classes...                   │
│                                              │
│  ─────────────── border-t ───────────────    │
│                                              │
│  Comments (12)                               │
│  (CommentsSection — only if postId set)      │
│                                              │
│  ─────────────── border-t ───────────────    │
│                                              │
│  More Articles                      [< >]    │
│  [card] [card] [card] [card] →→→             │
│  (MoreArticles — only if currentSlug set)    │
│                                              │
└──────────────────────────────────────────────┘
```

## Sections

### Category + Read Time Bar
- `text-sm text-gray-500`
- Category name in `font-semibold text-black`
- Separated by `·` (middot)

### Title
- `text-3xl md:text-4xl lg:text-5xl font-bold leading-tight`
- Responsive sizing across breakpoints

### Author + Date
- `text-sm text-gray-600`
- Date formatted via `toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })`
- Uses `<time dateTime={date}>` for semantic HTML

### Featured Image / Gallery
- Only renders when `images.length > 0`
- Passes to `FeaturedMedia`: single string when 1 image, full array when 2+
- Container: `mb-8 -mx-6 md:mx-0` (edge-to-edge on mobile, contained on desktop)
- Supports lightbox (click to expand), gallery navigation, loading spinners

### Article Body
- Rendered with `dangerouslySetInnerHTML`
- Tailwind Typography classes: `prose prose-lg max-w-none`
- Custom overrides: `prose-headings:font-bold prose-a:text-blue-700 prose-img:rounded-lg`

### Comments Section
- Rendered only when `postId` is provided (EM/IS only, not UMG)
- `{postId != null && <CommentsSection postId={postId} />}`
- Interactive client-side component — fetches/posts comments via WP REST API
- See `CommentsSection.md` for full spec

### More Articles Carousel
- Rendered only when `currentSlug` and `category` are provided (EM/IS only, not UMG)
- `{currentSlug && category && <MoreArticles currentSlug={currentSlug} category={category} />}`
- Horizontal-scroll carousel of 10 articles (alternating same-category and recent)
- Desktop arrow buttons + mobile swipe
- See `MoreArticles.md` for full spec

## Usage

### In Article Page Routes

```tsx
// apps/echo-media/app/articles/[slug]/page.tsx
// apps/international-spectrum/app/articles/[slug]/page.tsx

import { fetchArticleBySlug } from "@umg/api";
import { ArticleLayout } from "@umg/ui";

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  return (
    <ArticleLayout
      title={article.title}
      author={article.author_name}
      date={article.date}
      category={article.category}
      readTime={`${article.read_time_minutes} min read`}
      images={article.images}
      content={article.content}
      postId={article.id}
      currentSlug={article.slug}
    />
  );
}
```

## Content Pipeline

The `content` prop comes from this processing pipeline:

```
WP content.rendered (raw Divi HTML)
  → decodeShortcodeEntities() — fix &#8221; etc. in shortcode attrs
  → processContent() — extract images, gallery IDs, strip shortcodes
  → resolveMediaIds() — batch-fetch gallery image URLs from WP media API
  → toFullSizeUrl() — strip -WxH thumbnail suffixes from all image URLs
  → stripHtml() on category names — decode &amp; etc.
  → ArticleLayout receives clean HTML + deduplicated full-size image URLs
```

## Styling

### Container
- `min-h-screen bg-white`
- Article: `max-w-4xl mx-auto px-6 py-8`

### Typography
- Title: responsive `text-3xl` → `text-5xl`
- Meta text: `text-sm text-gray-500/600`
- Body: Tailwind `prose prose-lg` with custom heading, link, and image styles

## Client Component

This component has `"use client"` because it uses `FeaturedMedia` (gallery/lightbox state) and `CommentsSection` (comment fetching/submission state).

## Dependencies

- `packages/ui/sections/components/FeaturedMedia` — Image/gallery display with lightbox
- `packages/ui/article/CommentsSection` — Interactive comments section (see `docs/CommentsSection.md`)
- `packages/ui/article/MoreArticles` — More articles carousel (see `docs/MoreArticles.md`)
- `@tailwindcss/typography` — Must be installed and configured in each app's `globals.css`

## Files

| File | Purpose |
|------|---------|
| `packages/ui/article/ArticleLayout.tsx` | This component |
| `packages/ui/article/CommentsSection.tsx` | Comments section (rendered when `postId` is set) |
| `packages/ui/article/MoreArticles.tsx` | More articles carousel (rendered when `currentSlug` is set) |
| `packages/ui/sections/components/FeaturedMedia.tsx` | Image/gallery/lightbox |
| `packages/ui/index.ts` | Barrel export (`ArticleLayout`) |
| `apps/echo-media/app/articles/[slug]/page.tsx` | EM article route |
| `apps/international-spectrum/app/articles/[slug]/page.tsx` | IS article route |
| `apps/*/app/globals.css` | Must include `@plugin "@tailwindcss/typography"` |
