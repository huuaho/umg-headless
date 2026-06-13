# apps/umg/app/page.tsx

**Purpose:** Homepage — renders one article section per category, aggregated from the three media-company feeds.

## Responsibilities
Renders a visually-hidden (`sr-only`) `<h1>` as the first child of `<main>` — "United Media Group — Washington DC Multicultural Media: Diplomatic Watch, Echo Media, International Spectrum" — giving crawlers/AI a page descriptor without altering the design (AEO). Then maps every category from `lib/categories` to a `CategorySectionWrapper` (from `@umg/ui`), choosing a visual layout per category via the local `SECTION_TYPE_MAP` (slug → `type1`–`type4`, default `type1`). Wraps the sections in `SeenArticlesProvider` so they deduplicate articles already shown higher on the page. Passes `priority={index}` so earlier sections fetch/render first, a shared underline color (`#33bbff`), and the Arizona Sans font for section titles.

## Key exports
- `default Home() -> JSX` — the `/` route.

## Dependencies
- Internal: [lib/categories](../lib/categories.ts.md); `@umg/ui` [CategorySectionWrapper](../../../packages/ui/sections/README.md), [SeenArticlesProvider](../../../packages/ui/SeenArticlesContext.tsx.md)
- External: none beyond React/Next

## Used by
App Router — route `/`.

## Notes
Article fetching happens client-side inside the shared UI components (they call the WP API via `@umg/api`); this page is purely composition. Layout/data behavior changes belong in `packages/ui`, not here. The `sr-only` H1 is the single H1 for the route — section components emit H2s.

---
*Documented at commit 60deaa3.*
