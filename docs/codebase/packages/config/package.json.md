# packages/config/package.json

**Purpose:** Package manifest for the private `@umg/config` workspace package.

## Responsibilities
Declares `@umg/config` v0.0.0 (private) with `main`/`types` at [index.ts](index.ts.md) and a single dependency on `@umg/api` (`workspace:*`) for the section data types.

## Key exports
- n/a (manifest). Entry point: `./index.ts`.

## Dependencies
- Internal: [@umg/api](../api/package.json.md)
- External: none

## Used by
Listed as a dependency and in `transpilePackages` by all three apps (`apps/umg`, `apps/echo-media`, `apps/international-spectrum`), though its exports are currently unused in app code.

## Notes
- Ships raw TypeScript; no build step.

---
*Documented at commit 1cbdce5.*
