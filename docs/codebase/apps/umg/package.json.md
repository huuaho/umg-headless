# apps/umg/package.json

**Purpose:** Package manifest for the `umg` Next.js app (main United Media Group site).

## Responsibilities
Declares the app's scripts (`dev`, `build`, `start`, `lint` via `next` / `eslint`) and dependencies. Pulls in the three shared workspace packages (`@umg/api`, `@umg/config`, `@umg/ui`) via `workspace:*` protocol.

## Key exports
- N/A (manifest). Scripts: `dev`, `build`, `start`, `lint`.

## Dependencies
- Internal: [@umg/api](../../packages/api/README.md), `@umg/config`, [@umg/ui](../../packages/ui/README.md) (workspace packages)
- External: `next` 16.2.7, `react` / `react-dom` 19.2.7; dev: Tailwind CSS 4 (`@tailwindcss/postcss`), TypeScript 6, ESLint 9 + `eslint-config-next`

## Used by
pnpm workspace root and Turborepo task graph; the deploy-umg GitHub Actions workflow builds this package.

## Notes
`private: true`; version is a placeholder (0.1.0). No test script.

---
*Documented at commit 1cbdce5.*
