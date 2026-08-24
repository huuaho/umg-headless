# apps/umg/app/sitemap.ts

**Purpose:** Generates `/sitemap.xml` for the UMG site at build time.

## Responsibilities
A Next.js App Router metadata route (`force-static`, compatible with `output: 'export'`). Emits a `MetadataRoute.Sitemap` array: a hardcoded list of the main static routes (`/`, `/about-us`, `/contact`, `/search`, and `/how-to-enter` — re-added 2026-08-23 now that it serves the competition on-hold announcement; `/judges-panel` and `/photo-submission` stay commented out while the competition is postponed) with per-route `changeFrequency`/`priority`, plus one entry per category — mapped from `lib/categories` so adding a category updates the sitemap on rebuild. All URLs use the canonical `https://unitedmediadc.com` base with a trailing slash (matching `trailingSlash: true`).

## Key exports
- `default sitemap() -> MetadataRoute.Sitemap` — the route list (13 URLs as of this commit — 5 static + 8 categories).
- `dynamic = "force-static"`

## Dependencies
- Internal: [lib/categories](../lib/categories.ts.md)
- External: `next` (`MetadataRoute` type)

## Used by
Build output `apps/umg/out/sitemap.xml`; referenced by [robots.ts](robots.ts.md) and (pending) submitted to Google Search Console.

## Notes
**Competition postponed indefinitely (client request, 2026-08-13):** `/judges-panel` and `/photo-submission` remain commented out, matching the `notFound()` guards on those pages; `/how-to-enter` is back (monthly, 0.5) as the on-hold announcement. Uncomment the rest to restore. The base URL is hardcoded, not read from env. Routes are maintained by hand except categories — keep the static list in sync when adding/removing top-level routes.

---
*Documented at commit b9a61ff.*
