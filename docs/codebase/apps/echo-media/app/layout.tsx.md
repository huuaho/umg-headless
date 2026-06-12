# apps/echo-media/app/layout.tsx

**Purpose:** Root layout for the Echo Media site — wraps every page in the shared Header and Footer with Echo Media branding.

## Responsibilities
Defines the HTML shell for all routes. Loads Geist Sans / Geist Mono via `next/font/google` (exposed as CSS variables), imports the global stylesheet, sets site-wide metadata (`metadataBase: https://echo-media.info`, title "Echo Media", an education-focused description), and renders the shared `Header` above and `Footer` below the page content. Both components are fed Echo Media's local logo assets, its category list, and the cross-promotion `mediaCompanies` list.

## Key exports
- `metadata: Metadata` — site title/description and `metadataBase` for resolving OG image URLs.
- `RootLayout({ children }) -> JSX` — default export; HTML/body wrapper with Header, page content, Footer.

## Dependencies
- Internal: [lib/categories.ts](../lib/categories.ts.md) (`categories`), [lib/mediaCompanies.ts](../lib/mediaCompanies.ts.md) (`mediaCompanies`), [globals.css](globals.css.md), [@umg/ui Header](../../../packages/ui/Header.tsx.md), [@umg/ui Footer](../../../packages/ui/Footer.tsx.md)
- External: `next` (Metadata, `next/font/google`), `react`

## Used by
Next.js App Router — applied to every route in the app.

## Notes
- Header logo: `/images/banner/em-logo.svg` (color); Footer logo: `/images/banner/em-logo-black.png` (B&W) — both local assets under `public/images/banner/`.
- Footer gets `email="unitedmediagroup196@gmail.com"` and copyright "© 2026 Echo Media". No `socials` prop is passed (unlike the UMG app).
- **Difference vs international-spectrum:** only branding — IS uses `is-logo.svg` / `is-logo-black.svg`, `metadataBase` `https://internationalspectrum.org`, a global-culture description, and copyright "© 2026 International Spectrum Media". Structure is otherwise identical.

---
*Documented at commit 1cbdce5.*
