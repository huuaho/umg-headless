# apps/umg/app/judges-panel/HashScroller.tsx

**Purpose:** Client helper that smooth-scrolls to the URL hash target after hydration.

## Responsibilities
On mount, reads `window.location.hash`; if present, waits 100 ms (for the statically-exported DOM to settle after hydration) then `scrollIntoView({ behavior: "smooth" })` on the matching element. Renders nothing.

## Key exports
- `HashScroller() -> null` — side-effect-only client component.

## Dependencies
- Internal: none
- External: React (`useEffect`)

## Used by
[judges-panel/page.tsx](page.tsx.md) — enables `/judges-panel#<judge-id>` deep links from the how-to-enter judges grid.

## Notes
`"use client"`. Needed because native browser hash navigation can fire before the static-export page finishes hydrating; cleans up its timeout on unmount. Uses `document.querySelector(hash)`, so judge ids must be valid CSS selectors (they are kebab-case slugs).

---
*Documented at commit 1cbdce5.*
