# apps/umg/app/category/[slug]/page.tsx

**Purpose:** Category listing route — statically generated page per category slug.

## Responsibilities
Generates one static page per entry in `pageCategories` from `lib/categories` (the 8 nav categories + Video Interviews) via `generateStaticParams`, with `dynamicParams = false` so unknown slugs 404 (required for the static-export build). `generateMetadata` returns the bare category name as `title` (the root layout's title template appends "| United Media Group") plus a per-category `description` (templated as "`<name>` coverage from United Media Group’s pillars: Echo Media and International Spectrum" — Diplomatic Watch was dropped on 2026-10-01). The page body delegates entirely to `CategoryContent` from `@umg/ui` with `externalOnly` (article links go to the source media-company sites).

## Key exports
- `default CategoryPage({ params }) -> JSX` — the `/category/[slug]` route (async; awaits `params`).
- `generateStaticParams() -> {slug}[]` — one param set per category.
- `generateMetadata({ params })` — per-category title (via the layout template) + description.
- `dynamicParams = false`

## Dependencies
- Internal: [lib/categories](../../../lib/categories.ts.md); `@umg/ui` [CategoryContent](../../../../../packages/ui/CategoryContent.tsx.md)
- External: none

## Used by
App Router — routes `/category/world-news-politics`, `/category/diplomacy`, etc. (9 total, including `/category/video-interviews`); linked from Header nav and homepage section titles (Video Interviews only from its homepage section, not the nav).

## Notes
Uses Next 15+ async `params` (Promise). Adding a category to `lib/categories.ts` automatically adds a route here (it must end up in `pageCategories`).

Removing Diplomatic Watch as a content source (2026-10-01) did **not** change the route set: `lib/categories.ts` still lists all 8 nav categories, so Diplomacy, World News & Politics, Economy & Business and Wellbeing/Environment/Technology keep their routes and nav links while holding no articles — each renders `CategoryContent`’s "No articles found in this category" state. Whether to prune them from `lib/categories.ts` is an open decision; the [homepage](../../page.tsx.md) sidesteps the problem with `hideWhenEmpty`, which has no equivalent here because the category page *is* the destination.

---
*Documented at commit 0c47b38.*
