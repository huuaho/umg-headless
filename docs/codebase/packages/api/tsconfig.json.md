# packages/api/tsconfig.json

**Purpose:** TypeScript configuration for the `@umg/api` package.

## Responsibilities
Standalone (non-extending) config: `strict`, `noEmit`, ES2017 target, `module: esnext` with `bundler` resolution, `jsx: react-jsx`, includes all `**/*.ts`/`**/*.tsx`.

## Key exports
- n/a (config file).

## Dependencies
- Internal: none — duplicates the same options as [../config/tsconfig.base.json](../config/tsconfig.base.json.md) rather than extending it.
- External: none.

## Used by
TypeScript tooling/IDE when working inside `packages/api`. Type-checking only (`noEmit`) — actual compilation happens in the consuming Next.js apps.

## Notes
- Identical compilerOptions exist in [../ui/tsconfig.json](../ui/tsconfig.json.md) and [../config/tsconfig.base.json](../config/tsconfig.base.json.md); only `packages/config` actually uses the `extends` pattern.

---
*Documented at commit 1cbdce5.*
