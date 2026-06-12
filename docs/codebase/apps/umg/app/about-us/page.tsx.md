# apps/umg/app/about-us/page.tsx

**Purpose:** Static "About Us" page describing UMG, its three media platforms, values, partners, and contact info.

## Responsibilities
Renders seven sections: hero banner ("Diplomacy. Culture. Community."), Who We Are, Our Platforms (three cards driven by a local `platforms` array using the brand CSS variables from [globals.css](../globals.css.md)), a "My Hometown, My Lens" promo box linking to `/how-to-enter`, What Drives Us (local `values` array), Our Partners (reuses [HostingCommittees](../../components/HostingCommittees.tsx.md) with a custom title/subtitle), and Connect With Us (email info@unitedmediadc.com, Instagram @unitedmediagroupdc, X @unitedmedia_dc).

## Key exports
- `default AboutUsPage() -> JSX` — the `/about-us` route.

## Dependencies
- Internal: [components/HostingCommittees](../../components/HostingCommittees.tsx.md)
- External: `next/link`

## Used by
App Router — route `/about-us` (linked from Header/Footer nav in `@umg/ui`).

## Notes
All copy is hardcoded in two local const arrays (`platforms`, `values`); no CMS dependency. The competition blurb here (ages 10–30, Library of Congress / Smithsonian, $8,000 top prize) duplicates facts from [lib/competitions/current.ts](../../lib/competitions/current.ts.md) — keep them in sync manually. See also the prose doc `docs/about-us.md`.

---
*Documented at commit 1cbdce5.*
