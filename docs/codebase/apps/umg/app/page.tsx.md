# apps/umg/app/page.tsx

**Purpose:** Homepage — renders one article section per category, aggregated from the three media-company feeds.

## Responsibilities
Maps every category from `lib/categories` to a `CategorySectionWrapper` (from `@umg/ui`), choosing a visual layout per category via the local `SECTION_TYPE_MAP` (slug → `type1`–`type4`, default `type1`). Wraps everything in `SeenArticlesProvider` so sections deduplicate articles already shown higher on the page. Passes `priority={index}` so earlier sections fetch/render first, a shared underline color (`#33bbff`), and the Arizona Sans font for section titles.

## Key exports
- `default Home() -> JSX` — the `/` route.

## Dependencies
- Internal: [lib/categories](../lib/categories.ts.md); `@umg/ui` [CategorySectionWrapper](../../../packages/ui/sections/README.md), [SeenArticlesProvider](../../../packages/ui/SeenArticlesContext.tsx.md)
- External: none beyond React/Next

## Used by
App Router — route `/`.

## Notes
Article fetching happens client-side inside the shared UI components (they call the WP API via `@umg/api`); this page is purely composition. Layout/data behavior changes belong in `packages/ui`, not here.

---
*Documented at commit 1cbdce5.*
