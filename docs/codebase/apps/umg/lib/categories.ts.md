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
[app/layout.tsx](../app/layout.tsx.md) (Header/Footer props), [app/page.tsx](../app/page.tsx.md) (homepage sections, incl. `videoInterviewsCategory`), [app/category/[slug]/page.tsx](../app/category/[slug]/page.tsx.md) (`generateStaticParams` from `pageCategories`), [app/sitemap.ts](../app/sitemap.ts.md) (`pageCategories`).

## Notes
Category slugs must match WordPress category slugs on the backend — adding/renaming one here changes the homepage, nav, footer, sitemap, and the set of statically generated `/category/*` routes in one place. A category added to `categories` appears everywhere; one added only alongside `pageCategories` (like Video Interviews) gets a page/sitemap entry but stays out of nav and footer.

---
*Documented at commit 2354375.*
