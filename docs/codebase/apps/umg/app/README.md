# app/ — overview

Next.js App Router tree for the UMG site. The root layout supplies fonts, site metadata (OpenGraph/Twitter), and an Organization JSON-LD plus the shared Header/Footer; news routes (`/`, `/category/*`, `/search`) are thin wrappers over `@umg/ui` aggregator components, while the competition routes (`/how-to-enter`, `/judges-panel`, `/photo-submission`) are app-specific. Several routes carry per-page metadata and structured data (Event/FAQ/ContactPage JSON-LD) for AEO.

## Contents
| Item | Type | Summary |
|------|------|---------|
| [layout.tsx](layout.tsx.md) | file | Root layout: fonts, OG/Twitter metadata, Organization JSON-LD, `@umg/ui` Header/Footer (socials, `contactHref`, competition banner). |
| [page.tsx](page.tsx.md) | file | Homepage: sr-only H1 + one `CategorySectionWrapper` per category, deduped via SeenArticlesProvider. |
| [sitemap.ts](sitemap.ts.md) | file | Build-time `/sitemap.xml` — static routes + categories from `lib/categories`. |
| [robots.ts](robots.ts.md) | file | Build-time `/robots.txt` — allows all + named AI crawlers, points at the sitemap. |
| [globals.css](globals.css.md) | file | Tailwind 4 entry, `@source` scan of packages/ui, marquee animation, brand color variables. |
| [not-found.tsx](not-found.tsx.md) | file | Re-exports the shared 404 page. |
| [about-us/](about-us/README.md) | folder | About page: AEO-structured (H1 = org name, pillar H2s, mission sentence) + FAQ schema. |
| [contact/](contact/README.md) | folder | `/contact` page + ContactPage schema (new). |
| [category/](category/README.md) | folder | Statically generated `/category/[slug]` listing pages. |
| [how-to-enter/](how-to-enter/README.md) | folder | Photo-competition landing page + Event & FAQ schema. |
| [judges-panel/](judges-panel/README.md) | folder | Judge bios with hash-anchor scrolling. |
| [photo-submission/](photo-submission/README.md) | folder | Authenticated entry flow (sign-in → submit → pay). |
| [search/](search/README.md) | folder | Search route (shared UI). |
| icon.svg, old-icon.png | assets | Favicon/app icon files (App Router metadata convention); not documented individually. |

## Connections
```mermaid
graph LR
  layout["layout.tsx"] --> cats["lib/categories"]
  layout --> mc["lib/mediaCompanies"]
  layout --> ui["@umg/ui Header/Footer"]
  home["page.tsx"] --> cats
  home --> ui2["@umg/ui sections"]
  sitemap["sitemap.ts"] --> cats
  contact["contact/"] --> layout
  category["category/[slug]"] --> cats
  category --> ui2
  search["search/"] --> ui2
  hte["how-to-enter/"] --> comp["lib/competitions/*"]
  hte --> cmp["components/*"]
  jp["judges-panel/"] --> comp
  ps["photo-submission/"] --> auth["lib/auth/*"]
  ps --> comp
  ps --> cmp
  auth -.REST /wp-json/umg/v1.-> plugin["WP photo-contest plugin"]
```

## Entry points
Routes: `/`, `/about-us`, `/contact`, `/category/<slug>` (×8), `/search`, `/how-to-enter`, `/judges-panel`, `/photo-submission`, plus `/sitemap.xml`, `/robots.txt`, and the 404 page. All are statically exported (`output: "export"`).

---
*Documented at commit 60deaa3.*
