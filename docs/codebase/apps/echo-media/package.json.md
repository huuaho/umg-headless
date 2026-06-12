# apps/echo-media/package.json

**Purpose:** Package manifest for the Echo Media app — scripts, workspace links, and framework pins.

## Responsibilities
Declares the private `echo-media@0.1.0` workspace package with the standard Next.js scripts (`dev`, `build`, `start`, `lint`). Depends on the three shared workspace packages via `workspace:*` (`@umg/api`, `@umg/config`, `@umg/ui`) plus pinned `next@16.2.7`, `react`/`react-dom@19.2.7`. Dev deps cover Tailwind v4 (`tailwindcss`, `@tailwindcss/postcss`, `@tailwindcss/typography`), TypeScript 6, ESLint 9 with `eslint-config-next@16.2.7`, and type packages.

## Key exports
- n/a (manifest). Scripts: `dev` → `next dev`, `build` → `next build`, `start` → `next start`, `lint` → `eslint`.

## Dependencies
- Internal: [@umg/api](../../packages/api/package.json.md), [@umg/config](../../packages/config/package.json.md), [@umg/ui](../../packages/ui/package.json.md) (all `workspace:*`)
- External: `next` 16.2.7, `react` / `react-dom` 19.2.7; dev: Tailwind 4, TypeScript ^6, ESLint ^9

## Used by
pnpm workspace + Turborepo (run via the root `package.json` / `turbo.json` pipelines).

## Notes
- `start` (`next start`) only applies to dev-mode builds; production builds use `output: "export"` (static files in `out/`), which `next start` does not serve.
- `@umg/config` is listed and transpiled but the app code doesn't import it directly (it holds shared tsconfig base / dummy data).
- **Difference vs international-spectrum:** only the `name` field (`international-spectrum`); every version and script is identical.

---
*Documented at commit 1cbdce5.*
