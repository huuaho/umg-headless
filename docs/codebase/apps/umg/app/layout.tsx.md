# apps/umg/app/layout.tsx

**Purpose:** Root layout — fonts, metadata, and the shared Header/Footer chrome around every page.

## Responsibilities
Loads four fonts via `next/font` (Geist Sans/Mono, Libre Franklin 600, and the local ABC Arizona Sans Medium from `apps/umg/fonts/`) and exposes them as CSS variables (`--font-geist-sans`, `--font-geist-mono`, `--font-arizona-sans`, `--font-libre-franklin`). Defines the site's metadata and structured data for AEO/SEO, then renders the shared `Header` and `Footer` from `@umg/ui` around `{children}`:

- **Metadata** (`SITE_URL`/`SITE_DESCRIPTION` constants): `metadataBase`, a title template (`%s | United Media Group`), the canonical multicultural-media description, and full `openGraph` + `twitter` (`summary_large_image`, `@unitedmedia_dc`) blocks. The OG image points at an interim venue photo (`/images/venues/library-of-congress.jpg`) until the designed asset lands.
- **Organization JSON-LD**: a `NewsMediaOrganization` schema object injected as a `<script type="application/ld+json">` in the body — name, url, logo, description, Washington DC address, `email` (info@unitedmediadc.com), and `sameAs` (X + Instagram). `sameAs` must stay in sync with the Footer socials.
- Header: UMG logo, category nav from `lib/categories`, marquee banner companies from `lib/mediaCompanies`, an extra nav link and an announcement banner both pointing to `/how-to-enter`.
- Footer: black logo variant, same categories/companies, `email="info@unitedmediadc.com"`, `contactHref="/contact"` (routes "Contact Us" to the new contact page), copyright, `socials` (X + Instagram — UMG is the only app passing socials), and `apiBaseUrl` from `NEXT_PUBLIC_WP_API_URL`.

## Key exports
- `default RootLayout({ children }) -> JSX` — wraps all routes; renders the Organization JSON-LD.
- `metadata: Metadata` — title template, description, OpenGraph, Twitter card, `metadataBase`.

## Dependencies
- Internal: [lib/categories](../lib/categories.ts.md), [lib/mediaCompanies](../lib/mediaCompanies.ts.md), [globals.css](globals.css.md); `@umg/ui` [Header](../../../packages/ui/Header.tsx.md), [Footer](../../../packages/ui/Footer.tsx.md); local font `../fonts/ABCArizonaSans-Medium-Trial.otf`
- External: `next/font/google`, `next/font/local`

## Used by
Next.js App Router — wraps every route in the app. Per-page `metadata` exports override the base via the title template.

## Notes
Reads `process.env.NEXT_PUBLIC_WP_API_URL` at build time (static export inlines it). Only the Medium weight of Arizona Sans is loaded even though 11 font files ship in `fonts/`. The Organization schema's `sameAs`, the Footer `socials`, and the per-page schemas (Event/FAQ/ContactPage) should describe the same entity with consistent URLs/wording — that consistency is the AEO goal.

---
*Documented at commit 60deaa3.*
