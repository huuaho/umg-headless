# apps/umg/tsconfig.json

**Purpose:** TypeScript configuration for the umg app.

## Responsibilities
Standard Next.js app tsconfig: strict mode, `noEmit`, bundler module resolution, `react-jsx`, Next.js TS plugin. Defines the `@/*` path alias pointing at the app root (`apps/umg/`), which all app imports like `@/lib/...` and `@/components/...` resolve through.

## Key exports
- N/A (config).

## Dependencies
- Internal: none
- External: TypeScript, Next.js TS plugin

## Used by
`tsc`, Next.js build, editors.

## Notes
Includes `.next/types` and `**/*.mts`; excludes `node_modules`. Target ES2017.

---
*Documented at commit 1cbdce5.*
