# packages/ui/article/ArticleLayout.tsx

**Purpose:** Full article-detail page layout — category label, title, byline, YouTube embed or hero image, article body, plus optional comments and a "More Articles" carousel.

## Responsibilities
- Renders metadata header: category (linked to `/category/{categorySlug}` when a slug is given, colored via `categoryColor`), read time, title, author, and formatted date.
- Hero media: if `videoUrl` contains a parseable YouTube ID, embeds a responsive 16:9 iframe and suppresses the image hero.
- Body: delegates to [ArticleBody](ArticleBody.tsx.md) when `blocks` is present, so images render where the author placed them and galleries render in place.
- **Legacy fallback** when `blocks` is absent: hoists every image into one [FeaturedMedia](../sections/components/FeaturedMedia.tsx.md) carousel above the body and injects `content` via `dangerouslySetInnerHTML`. Only reachable from a caller that does not pass `blocks` — both live article routes do.
- Conditionally mounts [CommentsSection](CommentsSection.tsx.md) when `postId` is provided and [MoreArticles](MoreArticles.tsx.md) when `currentSlug` + `category` are provided — both EM/IS-only features; UMG omits these props.

## Key exports
- `ArticleLayout({ title, author, date, category, readTime, images, content, blocks?, postId?, currentSlug?, categoryColor?, categorySlug?, categoryColorMap?, videoUrl? })` (default). `images` and `content` feed the legacy fallback only.

## Dependencies
- Internal: [ArticleBody.tsx](ArticleBody.tsx.md), [../sections/components/FeaturedMedia.tsx](../sections/components/FeaturedMedia.tsx.md), [CommentsSection.tsx](CommentsSection.tsx.md), [MoreArticles.tsx](MoreArticles.tsx.md), [@umg/api](../../api/content.ts.md) (type-only `ContentBlock`)
- External: `react`, `next/link`

## Used by
- EM/IS `app/articles/[slug]/page.tsx` — pages fetch the article server-side via `fetchArticleBySlug` ([../../api/client.ts](../../api/client.ts.md)) and pass the pieces in. UMG has no article detail pages (all links are external).

## Notes
- `"use client"` component. Both `content` and `blocks` must already be sanitized — the WP body is Divi-stripped by [packages/api/content.ts](../../api/content.ts.md) before reaching here; this component trusts its input.
- YouTube ID extraction supports `watch?v=`, `youtu.be/`, and `embed/` URL forms.

---
*Documented at commit e636e60.*
