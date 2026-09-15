# apps/umg/app/page.tsx

**Purpose:** Homepage — renders one article section per category, aggregated from the three media-company feeds.

## Responsibilities
Renders a visually-hidden (`sr-only`) `<h1>` as the first child of `<main>` — "United Media Group — Washington DC Multicultural Media: Diplomatic Watch, Echo Media, International Spectrum" — giving crawlers/AI a page descriptor without altering the design (AEO). Inside `SeenArticlesProvider` it renders, in order:
1. A **Latest** section (`latest` prop, `type1`) — newest posts across all sources/categories, same pattern as the International Spectrum homepage. Rendered without `priority`, so it doesn't take part in dedup and the category sections below are unaffected (items may repeat).
2. A **Video Interviews** section (`videoInterviewsCategory` from `lib/categories`, `type4`, `priority={0}`, `hideWhenEmpty`) — client request 2026-08-28: on the front page directly under Latest but not in the top nav; renders nothing until the backend `video-interviews` category has posts.
3. One `CategorySectionWrapper` per entry in `categories`, choosing a visual layout via the local `SECTION_TYPE_MAP` (slug → `type1`–`type4`, default `type1`), with `priority={index + 1}` (shifted so Video Interviews claims articles first) for cross-section dedup.

All sections share a `SECTION_STYLE` constant (underline color `#33bbff`, Arizona Sans title font) spread onto each wrapper.

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
*Documented at commit 2354375.*
