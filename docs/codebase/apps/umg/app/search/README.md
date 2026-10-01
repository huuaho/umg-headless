# app/search/ — overview

Route segment for `/search` — a thin wrapper around the shared search UI, plus the route's static metadata.

## Contents
| Item | Type | Summary |
|------|------|---------|
| [page.tsx](page.tsx.md) | file | Renders `@umg/ui` SearchContent with `externalOnly`; exports static `metadata` (title `Search`, description naming the two remaining pillars — Diplomatic Watch was removed 2026-10-01, `0c47b38`). |

## Connections
```mermaid
graph LR
  page["search/page.tsx"] --> SC["@umg/ui SearchContent"]
```

## Entry points
- Route: `/search` (Header search UI).

---
*Documented at commit 6e04fee.*
