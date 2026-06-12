# packages/api/package.json

**Purpose:** Package manifest for the private `@umg/api` workspace package.

## Responsibilities
Declares the package as `@umg/api` v0.0.0 (private), with `main`/`types` pointing directly at the untranspiled [index.ts](index.ts.md).

## Key exports
- n/a (manifest). Entry point: `./index.ts`.

## Dependencies
- Internal: none
- External: devDependencies `@types/node` ^22, `@types/react` ^19; peerDependency `react` ^18 || ^19 (for the [useArticles](hooks/useArticles.ts.md) hook).

## Used by
All three apps depend on `@umg/api` via `workspace:*` and transpile it through `transpilePackages` in their `next.config.ts`. Also a dependency of [@umg/ui](../ui/package.json.md) and [@umg/config](../config/package.json.md).

## Notes
- No build step — ships raw TypeScript; consumers must transpile.
- No runtime dependencies at all (native `fetch` only).

---
*Documented at commit 1cbdce5.*
