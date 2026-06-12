# packages/ui/package.json

**Purpose:** Package manifest for the private `@umg/ui` workspace package.

## Responsibilities
Declares `@umg/ui` v0.0.0 (private) with `main`/`types` at [index.ts](index.ts.md), a dependency on `@umg/api` (`workspace:*`), and peer dependencies on `next` (any) and `react` ^18 || ^19.

## Key exports
- n/a (manifest). Entry point: `./index.ts`.

## Dependencies
- Internal: [@umg/api](../api/package.json.md)
- External: peers `next`, `react`; devDependency `@types/react` ^19.

## Used by
All three apps depend on `@umg/ui` via `workspace:*` and list it in `transpilePackages` in `next.config.ts`.

## Notes
- Ships raw TSX; styling assumes the consuming app's Tailwind setup scans this package's files.

---
*Documented at commit 1cbdce5.*
