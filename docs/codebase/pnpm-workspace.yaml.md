# pnpm-workspace.yaml

**Purpose:** Declares pnpm workspace members, install-script allowlist, supply-chain release-age policy, and security version overrides.

## Responsibilities
Registers `packages/*` and `apps/*` as workspace packages so `workspace:*` references resolve locally (the three apps depend on `@umg/ui`, `@umg/api`, `@umg/config` this way). The `allowBuilds` block allowlists native post-install builds for `sharp` (image processing used by Next.js) and `unrs-resolver` — pnpm 10+ blocks install scripts by default.

Two dependency policies (added 2026-08 during the vulnerability sweep):
- **`minimumReleaseAge: 10080`** — pnpm refuses to resolve any package version published less than 7 days ago (value is in minutes), a supply-chain guard against freshly compromised releases. Applies to every `pnpm install`/`update`, locally and in CI. If a security patch must land faster, add the package to `minimumReleaseAgeExclude` temporarily.
- **`overrides`** — forces `postcss@<8.5.26` → `8.5.26` and `sharp@<0.35.0` → `^0.35.3`, because Next.js pins older audit-flagged versions of both. Range-guarded, so the overrides become no-ops once Next's own pins catch up.

## Key exports
- `packages`: `packages/*`, `apps/*`
- `minimumReleaseAge`: `10080` (7 days)
- `allowBuilds`: `sharp`, `unrs-resolver`
- `overrides`: postcss ≥8.5.26, sharp ≥0.35.3

## Dependencies
- Internal: none — this file defines the workspace topology consumed by [package.json](package.json.md) and Turborepo ([turbo.json](turbo.json.md))
- External: pnpm (11.5.2, pinned in root package.json)

## Used by
`pnpm install` (local and CI). Turborepo discovers packages through pnpm's workspace definition.

## Notes
If a new app or shared package is added outside `apps/`/`packages/`, it must be added here or it silently won't be linked. When `pnpm update` reports the newest version of something as unavailable, check its publish date against the 7-day `minimumReleaseAge` floor before assuming a registry problem.

---
*Documented at commit b9a61ff.*
