# apps/umg/eslint.config.mjs

**Purpose:** Flat ESLint config for the umg app.

## Responsibilities
Composes `eslint-config-next` core-web-vitals and TypeScript presets, re-applies the default ignore globs (`.next/`, `out/`, `build/`, `next-env.d.ts`), and turns off `@next/next/no-img-element` because the static-export build disables image optimization (plain `<img>` is intentional, e.g. in [SubmissionForm](app/photo-submission/components/SubmissionForm.tsx.md)).

## Key exports
- `default` — flat ESLint config array (via `defineConfig`).

## Dependencies
- Internal: none
- External: `eslint`, `eslint-config-next`

## Used by
`pnpm lint` (the `lint` script in [package.json](package.json.md)).

## Notes
Trivial config; mirrors the sibling apps' setups.

---
*Documented at commit 1cbdce5.*
