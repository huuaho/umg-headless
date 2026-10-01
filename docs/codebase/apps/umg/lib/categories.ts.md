# apps/umg/lib/categories.ts

**Purpose:** Single source of truth for the site's content categories (8 nav + Video Interviews) and their nav/footer groupings.

## Responsibilities
Defines the `Category` shape (`name`, `slug`, hex `color`) and the ordered `categories` array (World News & Politics, Profiles & Opinions, Economy & Business, Diplomacy, Art & Culture, Education & Youth, Local Community, Wellbeing/Env/Tech). Additionally exports `videoInterviewsCategory` (slug `video-interviews`, sourced from International Spectrum via the ingestor plugin) — deliberately kept **out** of `categories` because the client (2026-08-28) wants it on the homepage but not in the top nav — and `pageCategories` (`categories` + Video Interviews), the list of everything that gets a `/category/<slug>` page. Derives presentation slices from `categories`: `mainCategories` (first 2, always visible on MD+), `lgOnlyCategories` (next 2, LG+), `moreCategories` (rest, in the "More" dropdown), `allCategories`, and alphabetically sorted `sortedCategories` split into `leftCategories`/`rightCategories` for the footer's two columns.

## Key exports
- `Category` (interface), `categories: Category[]`
- `videoInterviewsCategory: Category`, `pageCategories: Category[]` (nav categories + Video Interviews)
- `mainCategories`, `lgOnlyCategories`, `moreCategories`, `allCategories`
- `sortedCategories`, `leftCategories`, `rightCategories`

## Dependencies
- Internal: none
- External: none

## Used by
[lib/activeCategories.ts](activeCategories.ts.md) (filters `categories` down to the populated ones — this is what actually reaches the nav, footer and homepage sections), [app/layout.tsx](../app/layout.tsx.md) (indirectly, via `activeCategories`), [app/page.tsx](../app/page.tsx.md) (`videoInterviewsCategory` directly, the rest via `activeCategories`), [app/category/[slug]/page.tsx](../app/category/[slug]/page.tsx.md) (`generateStaticParams` from `pageCategories`), [app/sitemap.ts](../app/sitemap.ts.md) (`pageCategories`).

## Notes
Category slugs must match WordPress category slugs on the backend — adding/renaming one here changes the homepage, nav, footer, sitemap, and the set of statically generated `/category/*` routes in one place. A category added to `categories` appears everywhere; one added only alongside `pageCategories` (like Video Interviews) gets a page/sitemap entry but stays out of nav and footer.

Since 2026-10-01 this array is the *candidate* list rather than what renders: [activeCategories.ts](activeCategories.ts.md) filters it at build time to the categories that actually hold articles, and the nav, footer and homepage sections consume that filtered result. `pageCategories` is deliberately **not** filtered, so `/category/<slug>` routes still exist for every entry here. The `mainCategories` / `lgOnlyCategories` / `moreCategories` slices are legacy exports — [Header](../../../packages/ui/Header.tsx.md) computes its own equivalent splits from the `categories` prop it is handed.

---
*Documented at commit 5f27b41.*
