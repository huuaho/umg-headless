# apps/umg/lib/mediaCompanies.ts

**Purpose:** Data for the two sibling UMG media companies shown in the header marquee banner and footer.

## Responsibilities
Defines `MediaCompany` (`name`, `description`, `url`, `logo`, `logoBW`) and the `mediaCompanies` array: Echo Media and International Spectrum Media. Logo paths point at local assets in `public/images/banner/` (color variant for the marquee, black/B&W variant for the footer).

## Key exports
- `MediaCompany` (interface), `mediaCompanies: MediaCompany[]`

## Dependencies
- Internal: none (asset paths into `public/images/banner/`)
- External: none

## Used by
[app/layout.tsx](../app/layout.tsx.md) — passed to `@umg/ui` `Header` (`bannerCompanies`) and `Footer` (`companies`).

## Notes
- Banner logos were migrated from WP uploads to local assets; each of the three apps keeps its own copy.
- `public/images/banner/` holds exactly these 2 companies × 2 variants = 4 files; the UMG logo itself is not in the marquee and lives at `public/umg-logo*.svg`.
- **The marquee repeat count is tied to the company count.** `packages/ui/Header.tsx` repeats this list 8× inside the `animate-marquee` strip, and `@keyframes marquee` (globals.css) scrolls it to `translateX(-50%)` over 20s — so *half* the repeated strip must be at least as wide as the banner's inner width (`max-w-[1440px]` less `lg:px-8`, up to ~1376px), or a blank gap opens on the right and grows across each cycle. Going from 3 companies to 2 dropped this app's half-strip to ~842px and broke the loop; the repeat was raised 4× → 8× (half-strip now ~1685px). Shortening the list again means re-checking that margin. The separate announcement-banner marquee lower in the same file is unaffected and still repeats 4×.
- **Diplomatic Watch Magazine** (`diplomaticwatch.com`) was removed from this list at the client's request on 2026-10-01, along with its `dw-logo*` assets.

---
*Documented at commit 0c47b38.*
