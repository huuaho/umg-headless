# apps/umg/postcss.config.mjs

**Purpose:** PostCSS config enabling Tailwind CSS 4.

## Responsibilities
Registers the single `@tailwindcss/postcss` plugin — all Tailwind configuration lives in CSS (see [app/globals.css](app/globals.css.md)), per Tailwind 4 conventions.

## Key exports
- `default` — PostCSS config object.

## Dependencies
- Internal: none
- External: `@tailwindcss/postcss`

## Used by
Next.js build pipeline.

## Notes
Trivial config; no tailwind.config file exists (Tailwind 4 CSS-first setup).

---
*Documented at commit 1cbdce5.*
