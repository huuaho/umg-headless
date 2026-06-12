# apps/echo-media/app/globals.css

**Purpose:** Global stylesheet — Tailwind 4 setup, Echo Media theme variables, and the marquee banner animation.

## Responsibilities
Imports Tailwind CSS v4, registers `packages/ui/` as a `@source` so Tailwind scans the shared UI package for class names, and loads the `@tailwindcss/typography` plugin (used by article body rendering). Defines the site's two theming CSS variables, base body styles (white background, `#212223` text, Roboto font stack), smooth scrolling, the `marquee` keyframes + `.animate-marquee` class (20s linear loop, pauses on hover) used by the Header's partner-logo marquee, and strips the bottom border from the last homepage section so it doesn't clash with the Footer's top border.

## Key exports
- (CSS) `--banner-border-color: #0281b3` — Echo Media blue accent used by the shared Header/Footer banner borders.
- (CSS) `--footer-bg: #d9ecf3` — light blue Footer background.
- (CSS) `.animate-marquee` — scrolling animation consumed by the Header marquee in `@umg/ui`.

## Dependencies
- Internal: scans [packages/ui](../../../packages/ui/README.md) via `@source` (Tailwind content detection only — no import).
- External: `tailwindcss` (v4 CSS-first config), `@tailwindcss/typography`

## Used by
[app/layout.tsx](layout.tsx.md) (imported once, applies globally).

## Notes
- This file *is* the Tailwind config (v4 CSS-first); there is no `tailwind.config.*`.
- **Difference vs international-spectrum:** only the variable values — IS uses `--banner-border-color: #feb70c` (yellow) and `--footer-bg: #e8e6f2` (light purple). All other rules are byte-identical.
- The body font stack is Roboto/Helvetica/Arial even though `layout.tsx` loads Geist fonts as CSS variables; Geist is only applied where the `--font-geist-*` variables are referenced.

---
*Documented at commit 1cbdce5.*
