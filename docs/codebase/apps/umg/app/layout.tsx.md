# apps/umg/app/layout.tsx

**Purpose:** Root layout — fonts, metadata, and the shared Header/Footer chrome around every page.

## Responsibilities
Loads four fonts via `next/font` (Geist Sans/Mono, Libre Franklin 600, and the local ABC Arizona Sans Medium from `apps/umg/fonts/`) and exposes them as CSS variables (`--font-geist-sans`, `--font-geist-mono`, `--font-arizona-sans`, `--font-libre-franklin`). Sets site metadata ("United Media Group" — news aggregator for Diplomatic Watch, Echo Media, International Spectrum). Renders the shared `Header` and `Footer` from `@umg/ui` around `{children}`, wiring in:

- Header: UMG logo, category nav from `lib/categories`, marquee banner companies from `lib/mediaCompanies`, an extra nav link and an announcement banner both pointing to `/how-to-enter` (the photo competition).
- Footer: black logo variant, same categories/companies, contact email, copyright, `socials` (X + Instagram — UMG is the only app passing socials), and `apiBaseUrl` from `NEXT_PUBLIC_WP_API_URL` (used by the Footer's newsletter signup).

## Key exports
- `default RootLayout({ children }) -> JSX` — wraps all routes.
- `metadata: Metadata` — site title/description.

## Dependencies
- Internal: [lib/categories](../lib/categories.ts.md), [lib/mediaCompanies](../lib/mediaCompanies.ts.md), [globals.css](globals.css.md); `@umg/ui` [Header](../../../packages/ui/Header.tsx.md), [Footer](../../../packages/ui/Footer.tsx.md); local font `../fonts/ABCArizonaSans-Medium-Trial.otf`
- External: `next/font/google`, `next/font/local`

## Used by
Next.js App Router — wraps every route in the app.

## Notes
Reads `process.env.NEXT_PUBLIC_WP_API_URL` at build time (static export inlines it). Only the Medium weight of Arizona Sans is loaded even though 11 font files ship in `fonts/`.

---
*Documented at commit 1cbdce5.*
