# apps/umg/app/page.tsx

**Purpose:** Homepage — renders one article section per category, aggregated from the three media-company feeds.

## Responsibilities
Renders a visually-hidden (`sr-only`) `<h1>` as the first child of `<main>` — "United Media Group — Washington DC Multicultural Media: Echo Media, International Spectrum" — giving crawlers/AI a page descriptor without altering the design (AEO). Inside `SeenArticlesProvider` it renders, in order:
1. A **Latest** section (`latest` prop, `type1`) — newest posts across all sources/categories, same pattern as the International Spectrum homepage. Rendered without `priority`, so it doesn't take part in dedup and the category sections below are unaffected (items may repeat).
2. A **Video Interviews** section (`videoInterviewsCategory` from `lib/categories`, `type4`, `priority={0}`, `hideWhenEmpty`) — client request 2026-08-28: on the front page directly under Latest but not in the top nav; renders nothing until the backend `video-interviews` category has posts.
3. One `CategorySectionWrapper` per entry in the **filtered** category list from [lib/activeCategories](../lib/activeCategories.ts.md) (awaited at the top of the component), choosing a visual layout via the local `SECTION_TYPE_MAP` (slug → `type1`–`type4`, default `type1`), with `priority={index + 1}` (shifted so Video Interviews claims articles first) for cross-section dedup, and `hideWhenEmpty` on every one of them (see Notes).

All sections share a `SECTION_STYLE` constant (underline color `#33bbff`, Arizona Sans title font) spread onto each wrapper.

## Key exports
- `default async Home() -> Promise<JSX>` — the `/` route. **Async**, because it awaits `getActiveCategories()`.

## Dependencies
- Internal: [lib/activeCategories](../lib/activeCategories.ts.md), [lib/categories](../lib/categories.ts.md) (for `videoInterviewsCategory`); `@umg/ui` [CategorySectionWrapper](../../../packages/ui/sections/README.md), [SeenArticlesProvider](../../../packages/ui/SeenArticlesContext.tsx.md)
- External: none beyond React/Next

## Used by
App Router — route `/`.

## Notes
Article fetching happens client-side inside the shared UI components (they call the WP API via `@umg/api`); this page is purely composition. Layout/data behavior changes belong in `packages/ui`, not here. The `sr-only` H1 is the single H1 for the route — section components emit H2s.

**Diplomatic Watch removed (client request, 2026-10-01):** DW was ~92% of the ingested article corpus, so dropping it left 4 of the 8 nav categories (Diplomacy, World News & Politics, Economy & Business, Wellbeing/Environment/Technology) with zero articles. The mapped category sections therefore pass `hideWhenEmpty` — the same flag the Video Interviews section already used — so the homepage renders nothing for them instead of four "No articles found" error cards. The flag hides *empty*, not *broken*: [CategorySectionWrapper](../../../packages/ui/sections/README.md) only returns `null` when there is no error and the article list is empty, so a genuinely failing API still shows its error card rather than silently vanishing. **Empty categories are now filtered before render (2026-10-01):** sections are built from [`getActiveCategories()`](../lib/activeCategories.ts.md), not the raw `categories` list — 10 sections down to 6. Before this, the four empty categories each still mounted a wrapper, fired an API request for 10 articles and rendered a loading skeleton before `hideWhenEmpty` removed them: four wasted requests and a visible flicker on every homepage load. `hideWhenEmpty` is deliberately kept as the runtime backstop, since the build-time list is a snapshot (a category can empty out afterwards) and a build that took the API fail-safe path passes every category through. The nav and footer are filtered through the same function in [layout.tsx](layout.tsx.md); `/category/<slug>` routes are intentionally still generated for all 8 so old inbound links resolve to a graceful empty state rather than a 404.

---
*Documented at commit 5f27b41.*
