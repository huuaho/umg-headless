# apps/umg/lib/categories.ts

**Purpose:** Single source of truth for the site's 8 content categories and their nav/footer groupings.

## Responsibilities
Defines the `Category` shape (`name`, `slug`, hex `color`) and the ordered `categories` array (World News & Politics, Profiles & Opinions, Economy & Business, Diplomacy, Art & Culture, Education & Youth, Local Community, Wellbeing/Env/Tech). Derives presentation slices: `mainCategories` (first 2, always visible on MD+), `lgOnlyCategories` (next 2, LG+), `moreCategories` (rest, in the "More" dropdown), `allCategories`, and alphabetically sorted `sortedCategories` split into `leftCategories`/`rightCategories` for the footer's two columns.

## Key exports
- `Category` (interface), `categories: Category[]`
- `mainCategories`, `lgOnlyCategories`, `moreCategories`, `allCategories`
- `sortedCategories`, `leftCategories`, `rightCategories`

## Dependencies
- Internal: none
- External: none

## Used by
[app/layout.tsx](../app/layout.tsx.md) (Header/Footer props), [app/page.tsx](../app/page.tsx.md) (homepage sections), [app/category/[slug]/page.tsx](../app/category/[slug]/page.tsx.md) (`generateStaticParams`).

## Notes
Category slugs must match WordPress category slugs on the backend — adding/renaming one here changes the homepage, nav, footer, and the set of statically generated `/category/*` routes in one place.

---
*Documented at commit 1cbdce5.*
