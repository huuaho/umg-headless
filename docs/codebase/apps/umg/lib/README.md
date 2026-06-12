# lib/ — overview

Non-UI modules for the UMG app: site-wide data (categories, media companies) and the two photo-competition domains (config and auth/API).

## Contents
| Item | Type | Summary |
|------|------|---------|
| [categories.ts](categories.ts.md) | file | The 8 content categories + nav/footer slices; drives homepage sections and static category routes. |
| [mediaCompanies.ts](mediaCompanies.ts.md) | file | The 3 media companies (name, URL, color/B&W logos) for the marquee banner and footer. |
| [competitions/](competitions/README.md) | folder | Competition config-as-code: types, current competition, judges. |
| [auth/](auth/README.md) | folder | Competition auth context + REST client for the WP plugin. |

## Connections
```mermaid
graph LR
  layout["app/layout"] --> categories["categories.ts"]
  layout --> mediaCompanies["mediaCompanies.ts"]
  home["app/page"] --> categories
  catRoute["app/category/[slug]"] --> categories
  compPages["competition routes/components"] --> competitions["competitions/"]
  submission["photo-submission flow"] --> auth["auth/"]
  auth -.REST.-> plugin["WP photo-contest plugin"]
```

## Entry points
No routes — imported via the `@/lib/...` alias throughout `app/` and `components/`.

---
*Documented at commit 1cbdce5.*
