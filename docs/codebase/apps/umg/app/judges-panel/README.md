# app/judges-panel/ — overview

Route segment for `/judges-panel` — full-bio cards for the 15 competition judges, with hash-anchor deep linking.

## Contents
| Item | Type | Summary |
|------|------|---------|
| [page.tsx](page.tsx.md) | file | Hero banner + judge card grid; each card anchored by `id={judge.id}`. |
| [HashScroller.tsx](HashScroller.tsx.md) | file | Client no-render helper that smooth-scrolls to `location.hash` after hydration. |

## Connections
```mermaid
graph LR
  page["judges-panel/page.tsx"] --> judges["lib/competitions/judges"]
  page --> HS["HashScroller.tsx"]
```

## Entry points
- Route: `/judges-panel` (plus `#<judge-id>` anchors, linked from the how-to-enter judges grid).

## Status
**Competition postponed indefinitely (client request, 2026-08-13):** the page component calls `notFound()` first, so this route currently renders the 404 page; the sitemap entry and inbound links are commented out. Delete the guard line (grep "Competition postponed indefinitely") to restore.

---
*Documented at commit bde729d.*
