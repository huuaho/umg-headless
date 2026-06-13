# apps/umg/app/judges-panel/page.tsx

**Purpose:** Judges panel page — full bios of the competition jury.

## Responsibilities
Renders the same competition hero banner as `/how-to-enter`, then a responsive card grid (1/2/3 columns) of all judges from `lib/competitions/judges`: circular portrait (`next/image`), name, title, and bio (which may be JSX). Each card has `id={judge.id}` and `scroll-mt-24` so deep links like `/judges-panel#guy-djoken` land correctly below the sticky header; the client-side [HashScroller](HashScroller.tsx.md) performs the scroll after hydration.

## Key exports
- `default JudgesPanelPage() -> JSX` — the `/judges-panel` route.
- `metadata` — title "Competition Judges" + description (per-page override of the layout template).

## Dependencies
- Internal: [lib/competitions/judges](../../lib/competitions/judges.tsx.md), [HashScroller](HashScroller.tsx.md)
- External: `next/image`

## Used by
App Router — route `/judges-panel`; linked (with per-judge hash anchors) from the "Meet the Judges" section of [how-to-enter/page.tsx](../how-to-enter/page.tsx.md).

## Notes
Server component except for the embedded HashScroller. Judge portraits live in `public/images/judges/`.

---
*Documented at commit 60deaa3.*
