# packages/ui/article — overview

Article detail page components, used by Echo Media and International Spectrum (UMG links externally and has no article pages). ArticleLayout is the public composition; ArticleBody renders the body from ordered blocks, and comments and the related-articles carousel mount inside it when their props are provided.

## Contents
| Item | Type | Summary |
|------|------|---------|
| [ArticleLayout.tsx](ArticleLayout.tsx.md) | file | Full article page: meta header, YouTube embed or hero, body (via ArticleBody), optional comments + carousel. |
| [ArticleBody.tsx](ArticleBody.tsx.md) | file | Renders ordered content blocks — text, inline images, in-place galleries — keeping the author's image placement. Internal — exported from the barrel but only consumed by ArticleLayout. |
| [CommentsSection.tsx](CommentsSection.tsx.md) | file | WP comments: threaded (2 levels), paginated, anonymous submit with moderation handling. Internal — not in the barrel. |
| [MoreArticles.tsx](MoreArticles.tsx.md) | file | Snap-scroll carousel of 10 interleaved category/recent articles. Internal — not in the barrel. |

## Connections
```mermaid
graph LR
  AL[ArticleLayout.tsx] --> AB[ArticleBody.tsx]
  AL --> CS[CommentsSection.tsx]
  AL --> MA[MoreArticles.tsx]
  AL --> FM[../sections/components/FeaturedMedia.tsx]
  AB --> FM
  CS --> api["@umg/api (fetchComments, postComment)"]
  MA --> api2["@umg/api (fetchArticles)"]
  MA --> ALink[../ArticleLink.tsx]
```

## Entry points
- `ArticleLayout` (exported from [../index.ts](../index.ts.md)) — consumed by EM/IS `app/articles/[slug]/page.tsx`, which fetch the article server-side via `fetchArticleBySlug` and pass `postId`/`currentSlug` to enable comments/carousel, plus `blocks` to select the block renderer over the legacy hoist-everything layout.
- Comments talk to `GET`/`POST /wp/v2/comments` on the per-site WP backend through [packages/api/client.ts](../../api/client.ts.md) (wp mode only).

---
*Documented at commit e636e60.*
