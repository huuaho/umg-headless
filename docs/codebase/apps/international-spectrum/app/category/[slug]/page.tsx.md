# apps/international-spectrum/app/category/[slug]/page.tsx

**Purpose:** Category archive route — thin server wrapper around the shared `CategoryContent` listing component.

## Responsibilities
`generateStaticParams` emits one page per entry in the local `categories` list (7 pages for International Spectrum, from `communitypublicprograms` to `video-interviews`); `dynamicParams = false` 404s anything else. `generateMetadata` sets the title to `<Category Name> | International Spectrum`. The page resolves the slug to its display name and renders `CategoryContent`, which handles all client-side fetching, pagination, loading skeletons, and error states.

## Key exports
- `dynamicParams = false`
- `generateStaticParams() -> {slug}[]` — one per local category.
- `generateMetadata({params}) -> Metadata` — category page title.
- `CategoryPage({params}) -> JSX` — default export.

## Dependencies
- Internal: [lib/categories.ts](../../../lib/categories.ts.md) (`categories`), [@umg/ui CategoryContent](../../../../../packages/ui/CategoryContent.tsx.md)
- External: none beyond Next.js conventions.

## Used by
Next.js App Router — the `/category/[slug]` route. Linked from the Header nav (including the "More" dropdown for overflow categories), Footer nav, and category labels on article pages/sections.

## Notes
- The page itself fetches nothing; article data is loaded client-side inside `CategoryContent` via `@umg/api`.
- Falls back to the raw slug as the display name if the slug isn't in the local list (only reachable for slugs in `generateStaticParams`, so in practice always found).
- **Difference vs echo-media:** identical code except the "| Echo Media" title suffix; EM generates 3 category pages instead of 7.

---
*Documented at commit 1cbdce5.*
