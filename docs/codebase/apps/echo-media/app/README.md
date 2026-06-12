# apps/echo-media/app — overview

Next.js App Router tree for the Echo Media site. The pages here are deliberately thin: layout and homepage wire local site config (categories, media companies, branding) into shared `@umg/ui` components, and each route delegates rendering to a shared component.

## Contents
| Item | Type | Summary |
|------|------|---------|
| [layout.tsx](layout.tsx.md) | file | Root layout — Geist fonts, site metadata, shared Header/Footer with Echo Media branding. |
| [page.tsx](page.tsx.md) | file | Homepage — one `CategorySectionWrapper` per category (section types 1–3), with cross-section dedup. |
| [globals.css](globals.css.md) | file | Tailwind v4 CSS-first config, Echo Media theme variables (blue `#0281b3`), marquee animation. |
| [not-found.tsx](not-found.tsx.md) | file | 404 boundary — re-exports `NotFoundPage` from `@umg/ui`. |
| [about-us/](about-us/README.md) | folder | Static About Us page (mission/vision/values + contact). |
| [articles/[slug]/](articles/[slug]/README.md) | folder | Statically generated article detail pages. |
| [category/[slug]/](category/[slug]/README.md) | folder | Category archive pages (3 categories). |
| [search/](search/README.md) | folder | Search page wrapper around shared `SearchContent`. |
| icon.jpg | asset | Favicon (App Router file convention; no doc). |

## Connections
```mermaid
graph LR
  layout["layout.tsx"] --> globals["globals.css"]
  layout --> categories["../lib/categories.ts"]
  layout --> mediaCompanies["../lib/mediaCompanies.ts"]
  layout --> ui["@umg/ui (Header, Footer)"]
  home["page.tsx"] --> categories
  home --> ui2["@umg/ui (CategorySectionWrapper, SeenArticlesProvider)"]
  article["articles/[slug]/page.tsx"] --> categories
  article --> api["@umg/api"]
  article --> ui3["@umg/ui ArticleLayout"]
  category["category/[slug]/page.tsx"] --> categories
  category --> ui4["@umg/ui CategoryContent"]
  search["search/page.tsx"] --> ui5["@umg/ui SearchContent"]
  notfound["not-found.tsx"] --> ui6["@umg/ui NotFoundPage"]
```

## Entry points
- `/` — homepage (category sections)
- `/about-us/` — static About Us
- `/articles/<slug>/` — article detail (static, per WP post)
- `/category/<slug>/` — category archive (artculture, education, environment)
- `/search/` — full-text search (`?search=` query)
- 404 — any other URL or `notFound()` call

---
*Documented at commit 1cbdce5.*
