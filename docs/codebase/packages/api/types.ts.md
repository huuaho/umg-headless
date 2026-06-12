# packages/api/types.ts

**Purpose:** Central TypeScript type definitions for both WordPress API modes and the UI-facing article shapes.

## Responsibilities
- Defines the normalized article model (`ApiArticle`, `ApiCategory`, `ArticlesResponse`) that both API modes resolve to — the lingua franca between `@umg/api` and `@umg/ui`.
- Defines fetch option types (`FetchArticlesOptions`, `SearchArticlesOptions`).
- Defines the raw standard WP REST post shape (`WpPost`, from `wp/v2/posts?_embed`), including optional `author_display_name` (custom REST field from the IS plugin) and `authors` (PublishPress Authors plugin).
- Defines transformed UI types consumed by section components (`FeaturedArticle`, `SecondaryArticle`, `Type4Article`, `SectionData`, `SectionType4Data`).
- Defines comment types (`WpComment`, `CreateCommentPayload`) for `GET`/`POST /wp/v2/comments`.

## Key exports
- `ApiArticle` — normalized article: title, slug, date, source info, excerpt, full HTML `content` (Divi stripped), `featured_image`, `images[]`, author, categories, `read_time_minutes`, optional `video_url` (YouTube custom field).
- `ArticlesResponse` — paginated envelope `{ page, per_page, total, total_pages, items }`.
- `FetchArticlesOptions` / `SearchArticlesOptions` — query options (category slug, perPage, page, search).
- `WpPost` — raw standard WP REST post with `_embedded` author/media/terms.
- `FeaturedArticle` / `SecondaryArticle` / `Type4Article` / `SectionData` / `SectionType4Data` — UI shapes produced by [transformers.ts](transformers.ts.md). `slug` is present for internal articles (EM/IS) and absent for external ones (UMG) — this drives internal-vs-external linking in [ArticleLink](../ui/ArticleLink.tsx.md).
- `WpComment` / `CreateCommentPayload` — comment read/write payloads.

## Dependencies
- Internal: none (pure types)
- External: none

## Used by
Nearly every module in `packages/api` ([client.ts](client.ts.md), [wp-client.ts](wp-client.ts.md), [transformers.ts](transformers.ts.md), [hooks/useArticles.ts](hooks/useArticles.ts.md)), all data-driven `@umg/ui` components, and [packages/config/dummyData.ts](../config/dummyData.ts.md).

## Notes
- Types only — zero runtime code.
- `FeaturedArticle.gallery` is `string | string[]`: a single URL renders one image, an array renders the [FeaturedMedia](../ui/sections/components/FeaturedMedia.tsx.md) carousel.
- See [README.md](README.md) for the comparison of the two API modes this file models.

---
*Documented at commit 1cbdce5.*
