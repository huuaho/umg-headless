# apps/international-spectrum/app/layout.tsx

**Purpose:** Root layout for the International Spectrum site — wraps every page in the shared Header and Footer with IS branding.

## Responsibilities
Defines the HTML shell for all routes. Loads Geist Sans / Geist Mono via `next/font/google` (exposed as CSS variables), imports the global stylesheet, sets site-wide metadata (`metadataBase: https://internationalspectrum.org`, title "International Spectrum", a global-cultures description), and renders the shared `Header` above and `Footer` below the page content. Both components are fed International Spectrum's local logo assets, its 7-category list, and the cross-promotion `mediaCompanies` list.

## Key exports
- `metadata: Metadata` — site title/description and `metadataBase` for resolving OG image URLs.
- `RootLayout({ children }) -> JSX` — default export; HTML/body wrapper with Header, page content, Footer.

## Dependencies
- Internal: [lib/categories.ts](../lib/categories.ts.md) (`categories`, via `@/lib`), [lib/mediaCompanies.ts](../lib/mediaCompanies.ts.md) (`mediaCompanies`), [globals.css](globals.css.md), [@umg/ui Header](../../../packages/ui/Header.tsx.md), [@umg/ui Footer](../../../packages/ui/Footer.tsx.md)
- External: `next` (Metadata, `next/font/google`), `react`

## Used by
Next.js App Router — applied to every route in the app.

## Notes
- Header logo: `/images/banner/is-logo.svg` (color); Footer logo: `/images/banner/is-logo-black.svg` (B&W) — both local assets under `public/images/banner/`.
- Footer gets `email="info@unitedmediadc.com"` and copyright "© 2026 International Spectrum Media". No `socials` prop is passed (unlike the UMG app). The email was `unitedmediagroup196@gmail.com` until 2026-10-01, when all three sites were aligned on the UMG address; no `contactHref` is passed, so "Contact Us" stays a `mailto:` (there is no `/contact` route in this app, unlike UMG).
- **Difference vs echo-media:** only branding — EM uses `em-logo.svg` / `em-logo-black.png`, `metadataBase` `https://echo-media.info`, an education-focused description, and copyright "© 2026 Echo Media". Structure is otherwise identical.

---
*Documented at commit 23fe95c.*
