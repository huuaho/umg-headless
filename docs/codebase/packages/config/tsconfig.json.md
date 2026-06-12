# packages/config/tsconfig.json

**Purpose:** TypeScript configuration for the `@umg/config` package.

## Responsibilities
Extends [tsconfig.base.json](tsconfig.base.json.md) and adds `include: ["**/*.ts", "**/*.tsx"]`.

## Key exports
- n/a (config file).

## Dependencies
- Internal: [tsconfig.base.json](tsconfig.base.json.md)
- External: none

## Used by
TypeScript tooling/IDE for `packages/config`. Type-check only (`noEmit` inherited).

## Notes
- The only package tsconfig in `packages/` that uses the shared base via `extends`.

---
*Documented at commit 1cbdce5.*
