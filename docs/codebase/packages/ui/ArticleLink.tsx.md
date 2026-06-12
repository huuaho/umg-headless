# packages/ui/ArticleLink.tsx

**Purpose:** Smart link component that renders an internal Next.js link when an article has a slug, or an external new-tab link otherwise.

## Responsibilities
- With `slug`: renders `<Link href="/articles/{slug}">` (internal article detail page — EM/IS).
- Without `slug`: renders `<a href={url} target="_blank" rel="noopener noreferrer">` (external source — UMG aggregated articles).

## Key exports
- `ArticleLink({ slug?, url, className?, children })` (default).

## Dependencies
- Internal: none
- External: `next/link`, `react`

## Used by
- Every article-rendering component in this package: [ResultCard](ResultCard.tsx.md), [sections/SectionType1](sections/SectionType1.tsx.md)–[4](sections/SectionType4.tsx.md), [article/MoreArticles](article/MoreArticles.tsx.md).

## Notes
- The slug presence convention is enforced upstream: [packages/api/client.ts](../api/client.ts.md) blanks `slug` in custom (UMG) mode, and [transformers](../api/transformers.ts.md) map empty slug to `undefined` — so UMG always gets external links, EM/IS get internal routes.

---
*Documented at commit 1cbdce5.*
