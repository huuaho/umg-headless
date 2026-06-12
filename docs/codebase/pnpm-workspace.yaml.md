# pnpm-workspace.yaml

**Purpose:** Declares which folders are pnpm workspace members and which dependencies may run install-time build scripts.

## Responsibilities
Registers `packages/*` and `apps/*` as workspace packages so `workspace:*` references resolve locally (the three apps depend on `@umg/ui`, `@umg/api`, `@umg/config` this way). The `allowBuilds` block allowlists native post-install builds for `sharp` (image processing used by Next.js) and `unrs-resolver` — pnpm 10+ blocks install scripts by default.

## Key exports
- `packages`: `packages/*`, `apps/*`
- `allowBuilds`: `sharp`, `unrs-resolver`

## Dependencies
- Internal: none — this file defines the workspace topology consumed by [package.json](package.json.md) and Turborepo ([turbo.json](turbo.json.md))
- External: pnpm (11.5.2, pinned in root package.json)

## Used by
`pnpm install` (local and CI). Turborepo discovers packages through pnpm's workspace definition.

## Notes
If a new app or shared package is added outside `apps/`/`packages/`, it must be added here or it silently won't be linked.

---
*Documented at commit 1cbdce5.*
