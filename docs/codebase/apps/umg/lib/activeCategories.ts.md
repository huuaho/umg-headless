# apps/umg/lib/activeCategories.ts

**Purpose:** Resolve, at build time, which nav categories actually hold articles, so the nav, footer and homepage never link to or render an empty category.

## Responsibilities
Exports one async function, `getActiveCategories()`. It asks the articles API for a 1-item page per entry in [`categories`](categories.ts.md) (9 small requests, issued together via `Promise.all`), keeps the ones whose `total > 0`, and returns them in the original `categories` order.

It is **fail-safe by design**: any thrown error — or a result claiming *every* category is empty — returns the full `categories` array untouched. A transient API failure during `next build` must not ship a site with no navigation; the worst outcome of the fallback is a nav link to an empty category page, which is the behaviour that existed before this module.

## Key exports
- `getActiveCategories(): Promise<Category[]>`

## Dependencies
- Internal: [categories.ts](categories.ts.md) (the full ordered list and the `Category` type)
- External: `@umg/api` ([client.ts](../../../packages/api/client.ts.md)) — `fetchArticles`, read only for its `total`

## Used by
[app/layout.tsx](../app/layout.tsx.md) (feeds both `Header` and `Footer`), [app/page.tsx](../app/page.tsx.md) (which homepage sections to emit).

## Notes
- Added 2026-10-01 with the Diplomatic Watch removal. DW was 92.4% of the UMG corpus, and dropping it left four of the eight nav categories (World News & Politics, Economy & Business, Diplomacy, Wellbeing/Environment/Technology) with zero articles — the header, footer and homepage were all pointing at dead ends.
- **This is a point-in-time snapshot, not live state.** UMG is a static export, so the filter runs once per build. A category that gains its first article reappears only on the next build; the ingestor's cron keeps ingesting regardless, so a rebuild is what republishes the nav.
- Because of that staleness window, `CategorySectionWrapper`'s `hideWhenEmpty` is kept on the homepage sections as a runtime backstop — it also covers the case where a build legitimately took the fail-safe path and passed all 9 categories through.
- It deliberately does **not** filter `pageCategories`, so all `/category/<slug>` routes keep being generated and existing inbound links resolve to a graceful "No articles found in this category" page instead of a 404.
- `videoInterviewsCategory` is not part of `categories` and so is never filtered here; the homepage guards that section with `hideWhenEmpty` instead.

---
*Documented at commit 5f27b41.*
