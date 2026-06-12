# packages/ui/article/ArticleLayout.tsx

**Purpose:** Full article-detail page layout — category label, title, byline, featured media or YouTube embed, HTML body, plus optional comments and a "More Articles" carousel.

## Responsibilities
- Renders metadata header: category (linked to `/category/{categorySlug}` when a slug is given, colored via `categoryColor`), read time, title, author, and formatted date.
- Hero media: if `videoUrl` contains a parseable YouTube ID, embeds a responsive 16:9 iframe; otherwise renders [FeaturedMedia](../sections/components/FeaturedMedia.tsx.md) with the article's images (carousel when 2+); nothing if no media.
- Injects the sanitized article HTML via `dangerouslySetInnerHTML` styled with Tailwind `prose`.
- Conditionally mounts [CommentsSection](CommentsSection.tsx.md) when `postId` is provided and [MoreArticles](MoreArticles.tsx.md) when `currentSlug` + `category` are provided — both EM/IS-only features; UMG omits these props.

## Key exports
- `ArticleLayout({ title, author, date, category, readTime, images, content, postId?, currentSlug?, categoryColor?, categorySlug?, categoryColorMap?, videoUrl? })` (default).

## Dependencies
- Internal: [../sections/components/FeaturedMedia.tsx](../sections/components/FeaturedMedia.tsx.md), [CommentsSection.tsx](CommentsSection.tsx.md), [MoreArticles.tsx](MoreArticles.tsx.md)
- External: `react`, `next/link`

## Used by
- EM/IS `app/articles/[slug]/page.tsx` — pages fetch the article server-side via `fetchArticleBySlug` ([../../api/client.ts](../../api/client.ts.md)) and pass the pieces in. UMG has no article detail pages (all links are external).

## Notes
- `"use client"` component. `content` must already be sanitized — the WP body is Divi-stripped by [packages/api/content.ts](../../api/content.ts.md) before reaching here; this component trusts its input.
- YouTube ID extraction supports `watch?v=`, `youtu.be/`, and `embed/` URL forms.

---
*Documented at commit 1cbdce5.*
