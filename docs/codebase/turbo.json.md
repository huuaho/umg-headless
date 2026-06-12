# turbo.json

**Purpose:** Turborepo task graph — defines how `build`, `dev`, and `lint` run across the workspace.

## Responsibilities
Configures three tasks:
- **build** — `dependsOn: ["^build"]` (a package's dependencies build first; e.g. building `umg` builds `@umg/ui`/`@umg/api`/`@umg/config` if they had build steps). Cached outputs: `.next/**` (minus `.next/cache`), `out/**` (the static export each app deploys), `dist/**`.
- **dev** — uncached, `persistent: true` (long-running dev servers).
- **lint** — depends on upstream builds.

## Key exports
Tasks: `build`, `dev`, `lint`.

## Dependencies
- Internal: workspace layout from [pnpm-workspace.yaml](pnpm-workspace.yaml.md)
- External: `turbo` ^2.9.16 (root devDependency)

## Used by
- Root scripts in [package.json](package.json.md) (`turbo run dev --filter=<app>`)
- CI: `pnpm turbo run build --filter=<app>` in each [deploy workflow](.github/workflows/README.md)

## Notes
Apps use Next.js static export (`output: 'export'`), so the deployable artifact is `apps/<app>/out/` — covered by the `out/**` output glob, which makes Turborepo cache hits skip rebuilds when nothing changed.

---
*Documented at commit 1cbdce5.*
