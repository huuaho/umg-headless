# package.json

**Purpose:** Root workspace manifest — pins the package manager and provides the developer-facing `dev` scripts for each app.

## Responsibilities
Defines the monorepo root (`umg-workspace`, private, never published). Pins **pnpm 11.5.2** via the `packageManager` field (enforced by corepack/CI) and declares the only root dev dependency, **turbo ^2.9.16**, which orchestrates all builds.

## Key exports
Scripts (all delegate to Turborepo with an app filter):
- `dev` / `dev:umg` — `turbo run dev --filter=umg` (default dev target is the UMG site)
- `dev:em` — `turbo run dev --filter=echo-media`
- `dev:is` — `turbo run dev --filter=international-spectrum`

## Dependencies
- Internal: workspace members are declared in [pnpm-workspace.yaml](pnpm-workspace.yaml.md); task graph in [turbo.json](turbo.json.md)
- External: `turbo` (devDependency)

## Used by
- Developers (`pnpm dev:umg` etc.)
- CI workflows run `pnpm install --frozen-lockfile` and `pnpm turbo run build --filter=<app>` against this root — see [.github/workflows/](.github/workflows/README.md)

## Notes
There is no root `build`/`lint` script — CI invokes `pnpm turbo run build` directly. The pnpm version here is the source of truth for tooling (CI's `pnpm/action-setup@v6` reads `packageManager`).

---
*Documented at commit 1cbdce5.*
