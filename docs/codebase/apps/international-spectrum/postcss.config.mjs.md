# apps/international-spectrum/postcss.config.mjs

**Purpose:** PostCSS config — registers the Tailwind CSS v4 PostCSS plugin (the only plugin).

## Responsibilities
Exports a minimal config enabling `@tailwindcss/postcss`, which processes the `@import "tailwindcss"`, `@source`, and `@plugin` directives in [app/globals.css](app/globals.css.md). All actual Tailwind configuration lives in that CSS file (v4 CSS-first config — no `tailwind.config.*`).

## Key exports
- `config` — default export; `{ plugins: { "@tailwindcss/postcss": {} } }`.

## Dependencies
- Internal: none
- External: `@tailwindcss/postcss`

## Used by
Next.js build pipeline (CSS processing for every stylesheet in the app).

## Notes
- **Difference vs echo-media:** none; the files are byte-identical.

---
*Documented at commit 1cbdce5.*
