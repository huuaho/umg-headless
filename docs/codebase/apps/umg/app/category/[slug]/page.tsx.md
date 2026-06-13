# apps/umg/app/category/[slug]/page.tsx

**Purpose:** Category listing route — statically generated page per category slug.

## Responsibilities
Generates one static page per entry in `lib/categories` via `generateStaticParams`, with `dynamicParams = false` so unknown slugs 404 (required for the static-export build). `generateMetadata` returns the bare category name as `title` (the root layout's title template appends "| United Media Group") plus a per-category `description`. The page body delegates entirely to `CategoryContent` from `@umg/ui` with `externalOnly` (article links go to the source media-company sites).

## Key exports
- `default CategoryPage({ params }) -> JSX` — the `/category/[slug]` route (async; awaits `params`).
- `generateStaticParams() -> {slug}[]` — one param set per category.
- `generateMetadata({ params })` — per-category title (via the layout template) + description.
- `dynamicParams = false`

## Dependencies
- Internal: [lib/categories](../../../lib/categories.ts.md); `@umg/ui` [CategoryContent](../../../../../packages/ui/CategoryContent.tsx.md)
- External: none

## Used by
App Router — routes `/category/world-news-politics`, `/category/diplomacy`, etc. (8 total); linked from Header nav and homepage section titles.

## Notes
Uses Next 15+ async `params` (Promise). Adding a category to `lib/categories.ts` automatically adds a route here.

---
*Documented at commit 60deaa3.*
