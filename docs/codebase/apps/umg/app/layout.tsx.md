# apps/umg/app/layout.tsx

**Purpose:** Root layout — fonts, metadata, and the shared Header/Footer chrome around every page.

## Responsibilities
Loads four fonts via `next/font` (Geist Sans/Mono, Libre Franklin 600, and the local ABC Arizona Sans Medium from `apps/umg/fonts/`) and exposes them as CSS variables (`--font-geist-sans`, `--font-geist-mono`, `--font-arizona-sans`, `--font-libre-franklin`). Defines the site's metadata and structured data for AEO/SEO, then renders the shared `Header` and `Footer` from `@umg/ui` around `{children}`:

- **Metadata** (`SITE_URL`/`SITE_DESCRIPTION` constants): `metadataBase`, a title template (`%s | United Media Group`), the canonical multicultural-media description, and full `openGraph` + `twitter` (`summary_large_image`, `@unitedmedia_dc`) blocks. All three description strings name only the two remaining pillars — Echo Media and International Spectrum (see Notes). The OG image points at an interim venue photo (`/images/venues/library-of-congress.jpg`) until the designed asset lands.
- **Organization JSON-LD**: a `NewsMediaOrganization` schema object injected as a `<script type="application/ld+json">` in the body — name, url, logo, description, Washington DC address, `email` (info@unitedmediadc.com), and `sameAs` (X + Instagram). `sameAs` must stay in sync with the Footer socials.
- Header: UMG logo, category nav from `lib/activeCategories` (**not** the raw `lib/categories` — see Notes), marquee banner companies from `lib/mediaCompanies`. An `announcementBanner` reading "My Hometown My Lens Competition Update" links to `/how-to-enter` (the on-hold announcement, re-enabled 2026-08-23); the competition-era `extraLinks` nav item and original promotional banner remain commented out — see Notes.
- Footer: black logo variant, the same filtered categories and the same companies, `email="info@unitedmediadc.com"`, `contactHref="/contact"` (routes "Contact Us" to the new contact page), copyright, `socials` (X + Instagram — UMG is the only app passing socials), and `apiBaseUrl` from `NEXT_PUBLIC_WP_API_URL`.

## Key exports
- `default async RootLayout({ children }) -> Promise<JSX>` — wraps all routes; renders the Organization JSON-LD. **Async**, because it awaits `getActiveCategories()` at build time.
- `metadata: Metadata` — title template, description, OpenGraph, Twitter card, `metadataBase`.

## Dependencies
- Internal: [lib/activeCategories](../lib/activeCategories.ts.md) (which reads [lib/categories](../lib/categories.ts.md)), [lib/mediaCompanies](../lib/mediaCompanies.ts.md), [globals.css](globals.css.md); `@umg/ui` [Header](../../../packages/ui/Header.tsx.md), [Footer](../../../packages/ui/Footer.tsx.md); local font `../fonts/ABCArizonaSans-Medium-Trial.otf`
- External: `next/font/google`, `next/font/local`

## Used by
Next.js App Router — wraps every route in the app. Per-page `metadata` exports override the base via the title template.

## Notes
**Competition postponed indefinitely (client request, 2026-08-13):** the Header's competition nav link + original promotional banner are commented out (not removed); uncomment them to restore. Since 2026-08-23 a replacement `announcementBanner` points to the on-hold update on [/how-to-enter](how-to-enter/page.tsx.md). Companion changes: `notFound()` guards on the remaining competition pages and their sitemap entries — grep "Competition postponed indefinitely".

**Diplomatic Watch removed (client request, 2026-10-01):** `SITE_DESCRIPTION` and both social-card descriptions no longer name it. `SITE_DESCRIPTION` feeds the `metadata.description` *and* the Organization schema’s `description`, so one edit kept those two in sync; the shorter OpenGraph/Twitter strings are separate literals and had to be edited individually. The same canonical sentence is repeated in [about-us/page.tsx](about-us/page.tsx.md) — keep them identical.

**Nav is filtered to populated categories (2026-10-01):** the layout is `async` and awaits [`getActiveCategories()`](../lib/activeCategories.ts.md), passing the result to *both* `Header` and `Footer` so neither links to a category with no articles. This is resolved once per build (static export), and it fails safe — on an API error it returns all 8 categories rather than shipping a site with no navigation.

Reads `process.env.NEXT_PUBLIC_WP_API_URL` at build time (static export inlines it). Only the Medium weight of Arizona Sans is loaded even though 11 font files ship in `fonts/`. The Organization schema's `sameAs`, the Footer `socials`, and the per-page schemas (Event/FAQ/ContactPage) should describe the same entity with consistent URLs/wording — that consistency is the AEO goal.

---
*Documented at commit 5f27b41.*
