# packages/ui/tsconfig.json

**Purpose:** TypeScript configuration for the `@umg/ui` package.

## Responsibilities
Standalone config (identical options to [../api/tsconfig.json](../api/tsconfig.json.md)): `strict`, `noEmit`, ES2017, `module: esnext` + `bundler` resolution, `jsx: react-jsx`, includes all `**/*.ts`/`**/*.tsx`.

## Key exports
- n/a (config file).

## Dependencies
- Internal: none — duplicates [../config/tsconfig.base.json](../config/tsconfig.base.json.md) instead of extending it.
- External: none.

## Used by
TypeScript tooling/IDE for `packages/ui`. Type-check only; compilation happens in the consuming apps.

## Notes
- See the drift note in [../config/tsconfig.base.json.md](../config/tsconfig.base.json.md).

---
*Documented at commit 1cbdce5.*
