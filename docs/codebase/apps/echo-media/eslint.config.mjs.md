# apps/echo-media/eslint.config.mjs

**Purpose:** ESLint flat config — Next.js core-web-vitals + TypeScript rules with build artifacts ignored.

## Responsibilities
Uses ESLint 9's `defineConfig` to compose `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`, globally ignores generated output (`.next/`, `out/`, `build/`, `next-env.d.ts`), and disables `@next/next/no-img-element` (plain `<img>` is acceptable since images are unoptimized under static export anyway).

## Key exports
- `eslintConfig` — default export (flat config array).

## Dependencies
- Internal: none
- External: `eslint` (`eslint/config`), `eslint-config-next`

## Used by
`pnpm lint` (the `lint` script in [package.json](package.json.md)); CI lint runs.

## Notes
- `out/` is in the ignore list because production builds are static exports.
- **Difference vs international-spectrum:** none; the files are byte-identical.

---
*Documented at commit 1cbdce5.*
