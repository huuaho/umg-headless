# apps/umg/package.json

**Purpose:** Package manifest for the `umg` Next.js app (main United Media Group site).

## Responsibilities
Declares the app's scripts (`dev`, `build`, `start`, `lint` via `next` / `eslint`) and dependencies. Pulls in the three shared workspace packages (`@umg/api`, `@umg/config`, `@umg/ui`) via `workspace:*` protocol.

## Key exports
- N/A (manifest). Scripts: `dev`, `build`, `start`, `lint`.

## Dependencies
- Internal: [@umg/api](../../packages/api/README.md), `@umg/config`, [@umg/ui](../../packages/ui/README.md) (workspace packages)
- External: `next` 16.3.4, `react` / `react-dom` 19.2.8; dev: Tailwind CSS 4 (`@tailwindcss/postcss`), TypeScript 6, ESLint 9 + `eslint-config-next` 16.3.4, `@types/react-dom` ^19.2.7

## Used by
pnpm workspace root and Turborepo task graph; the deploy-umg GitHub Actions workflow builds this package.

## Notes
`private: true`; version is a placeholder (0.1.0). No test script.

- `next` and `eslint-config-next` are exact pins (no caret) and are kept on the same version as the other two apps.
- ⚠️ After bumping `next`, run **`pnpm dedupe`**. [packages/ui](../../packages/ui/package.json.md) declares `next: "*"` as a peer and pnpm pins that peer to the copy it already resolved, so the lockfile carries two full Next copies (apps on the new version, shared packages typechecking against the old one) until dedupe collapses them.
- Held back as majors needing their own pass: `@types/node` (22 → 26), `eslint` (9 → 10), `typescript` (6 → 7).

---
*Documented at commit 0c47b38.*
