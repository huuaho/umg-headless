# ArticleLink Component

## Overview

The ArticleLink component (`packages/ui/ArticleLink.tsx`) is a smart link that renders either an internal Next.js `<Link>` or an external `<a target="_blank">` based on whether the article has a `slug`.

## Purpose

The monorepo has two article models:
- **UMG**: Articles are external links (aggregated from other sites) — no `slug`
- **EM / IS**: Articles are hosted internally — have a `slug`

ArticleLink abstracts this difference so section components and search pages don't need conditional link logic.

## Props

```typescript
interface ArticleLinkProps {
  slug?: string;           // Present for internal articles (EM/IS), absent for external (UMG)
  url: string;             // Fallback URL for external links
  className?: string;      // CSS classes passed to the link element
  children: React.ReactNode;
}
```

## Behavior

| `slug` | Renders | Target |
|--------|---------|--------|
| `"my-article"` | `<Link href="/articles/my-article">` | Internal navigation |
| `undefined` | `<a href={url} target="_blank" rel="noopener noreferrer">` | New tab |

## Usage

### In Section Components (SectionType1-4)

```tsx
import ArticleLink from "./ArticleLink"; // or from "@umg/ui"

// Featured article link
<ArticleLink slug={featured.slug} url={featured.url} className="hover:underline">
  <h2>{featured.title}</h2>
</ArticleLink>

// Secondary article link
<ArticleLink slug={article.slug} url={article.url} className="hover:underline">
  {article.title}
</ArticleLink>
```

### In Search Pages

```tsx
import { ArticleLink } from "@umg/ui";

<ArticleLink slug={article.slug} url={article.source_url}>
  <h3>{article.title}</h3>
</ArticleLink>
```

## Data Flow

The `slug` prop flows through the data pipeline:

**EM/IS (WP mode):**
```
WP API post.slug
  → wpPostToApiArticle() → ApiArticle.slug
  → toFeaturedArticle() / toSecondaryArticle() / toType4Article()
    → slug: article.slug || undefined
  → Section components pass slug to <ArticleLink>
  → <Link href="/articles/{slug}"> (internal navigation)
```

**UMG (custom mode):**
```
Ingestor API → ApiArticle.slug (from um_remote_slug)
  → normalizeArticleUrls() in client.ts:
    - Builds correct source_url using slug + SOURCE_FRONTEND map
    - Clears slug to "" so ArticleLink uses external URL
  → toFeaturedArticle() → slug: "" || undefined → undefined
  → <a href={url} target="_blank"> (external link)
```

The ingestor API returns `slug` (the remote post's slug), but `normalizeArticleUrls()` uses it to build the correct headless URL (e.g., `https://www.internationalspectrum.org/articles/{slug}`) then clears it. This ensures UMG articles always render as external links since UMG has no article detail pages.

## Client Component

Has `"use client"` directive because it imports `next/link` which is a client component.

## Files

| File | Purpose |
|------|---------|
| `packages/ui/ArticleLink.tsx` | This component |
| `packages/ui/index.ts` | Barrel export (`ArticleLink`) |
| `packages/ui/sections/SectionType1.tsx` | Uses for featured + secondary links |
| `packages/ui/sections/SectionType2.tsx` | Same |
| `packages/ui/sections/SectionType3.tsx` | Same |
| `packages/ui/sections/SectionType4.tsx` | Same |
| `apps/echo-media/app/search/page.tsx` | Uses in SearchResultCard |
| `apps/international-spectrum/app/search/page.tsx` | Same |
| `packages/api/transformers.ts` | Passes `slug` through to UI types |
