# apps/umg/lib/mediaCompanies.ts

**Purpose:** Data for the three UMG media companies shown in the header marquee banner and footer.

## Responsibilities
Defines `MediaCompany` (`name`, `description`, `url`, `logo`, `logoBW`) and the `mediaCompanies` array: Echo Media, International Spectrum Media, and Diplomatic Watch Magazine. Logo paths point at local assets in `public/images/banner/` (color variant for the marquee, black/B&W variant for the footer).

## Key exports
- `MediaCompany` (interface), `mediaCompanies: MediaCompany[]`

## Dependencies
- Internal: none (asset paths into `public/images/banner/`)
- External: none

## Used by
[app/layout.tsx](../app/layout.tsx.md) — passed to `@umg/ui` `Header` (`bannerCompanies`) and `Footer` (`companies`).

## Notes
Banner logos were migrated from WP uploads to local assets; each of the three apps keeps its own copy (see `docs/components/banner-assets.md`). 4 companies × 2 variants exist as files, but only these 3 companies are listed here (the UMG logo itself lives at `public/umg-logo*.svg`).

---
*Documented at commit 1cbdce5.*
