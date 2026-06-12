# packages/config/index.ts

**Purpose:** Barrel file — public entry point of the `@umg/config` package.

## Responsibilities
Single line: re-exports everything from [dummyData.ts](dummyData.ts.md).

## Key exports
- `sectionType1Data`, `sectionType2Data`, `sectionType3Data`, `sectionType4Data`, `sectionType4TextOnlyData` (see [dummyData.ts](dummyData.ts.md)).

## Dependencies
- Internal: [dummyData.ts](dummyData.ts.md)
- External: none

## Used by
Declared as a `workspace:*` dependency and transpiled by all three apps, but no app code currently imports from it (verified by grep). Kept as a dev-fixture package.

## Notes
- `package.json` points `main`/`types` here.

---
*Documented at commit 1cbdce5.*
