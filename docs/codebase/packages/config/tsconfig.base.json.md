# packages/config/tsconfig.base.json

**Purpose:** Shared base TypeScript compiler options intended for reuse across the monorepo.

## Responsibilities
Defines the canonical compiler options: ES2017 target, DOM + esnext libs, `strict`, `noEmit`, `esModuleInterop`, `module: esnext` with `bundler` resolution, `resolveJsonModule`, `isolatedModules`, `jsx: react-jsx`, `incremental`; excludes `node_modules`. No `include` — that is left to extenders.

## Key exports
- n/a (config file).

## Dependencies
- Internal: none
- External: none

## Used by
- [tsconfig.json](tsconfig.json.md) in this same package (the only config that `extends` it). [packages/api](../api/tsconfig.json.md) and [packages/ui](../ui/tsconfig.json.md) duplicate these options inline instead of extending.

## Notes
- If the per-package configs drift, this file is the intended single source of truth — consider pointing the other packages' tsconfigs at it.

---
*Documented at commit 1cbdce5.*
