# apps/umg/app/globals.css

**Purpose:** Global stylesheet — Tailwind entry point plus site-wide base styles and brand variables.

## Responsibilities
- Imports Tailwind 4 (`@import "tailwindcss"`) and registers `packages/ui/` as an extra `@source` so Tailwind scans the shared UI components for class names (critical: without it, classes used only in `@umg/ui` would be purged).
- Sets base body styles (white background, `#212223` text, Roboto stack) and smooth scrolling (used by the judges-panel hash anchors).
- Defines the `marquee` keyframes + `.animate-marquee` class (20s scroll, pauses on hover) used by the Header's media-company banner.
- Declares platform brand color CSS variables (`--color-em`, `--color-is` and tagline variants) consumed by [app/about-us/page.tsx](about-us/page.tsx.md) — one pair per media pillar.
- Removes the bottom border from the last `<section>` in `main` to avoid clashing with the Footer's top border.

## Key exports
- N/A (stylesheet).

## Dependencies
- Internal: `@source "../../../packages/ui/"` (Tailwind content scan of the shared UI package)
- External: `tailwindcss`

## Used by
Imported once in [app/layout.tsx](layout.tsx.md); applies globally.

## Notes
The Roboto body font is a fallback stack only — display fonts are loaded via `next/font` in the root layout. The `.animate-marquee` class is referenced from `@umg/ui` components, not from this app's own code. The `--color-dw`/`--color-dw-tagline` pair was deleted when Diplomatic Watch was removed from UMG (client request, 2026-10-01) along with its [about-us](about-us/page.tsx.md) pillar card; the `--color-em`/`--color-is` pairs remain, so the variable set should always match the pillars that page renders.

---
*Documented at commit 0c47b38.*
