# .github/workflows/deploy-umg.yml

**Purpose:** Builds the UMG app and deploys its static export to SiteGround (unitedmediadc.com), then purges the SiteGround cache.

## Responsibilities
- **Triggers:** push to `main` touching `apps/umg/**` or `packages/**`; manual `workflow_dispatch`; `repository_dispatch` type `deploy-umg` (sent by the WordPress headless-config plugin on post changes).
- **Concurrency:** group `deploy-umg`, `cancel-in-progress: true` — rapid successive triggers don't queue.
- **Steps:** checkout (`actions/checkout@v6`) → Node 22 (`actions/setup-node@v6`) → pnpm (`pnpm/action-setup@v6`, version read from root `packageManager`) → `pnpm install --frozen-lockfile` → `pnpm turbo run build --filter=umg` → FTPS upload → SSH cache purge.
- **Build env:** `NEXT_PUBLIC_WP_API_URL` from secret `UMG_WP_API_URL` (baked into the bundle at build time).
- **Deploy:** `SamKirkland/FTP-Deploy-Action@v4.4.0`, FTPS, `apps/umg/out/` → `./unitedmediadc.com/public_html/`.
- **Cache purge:** `appleboy/ssh-action@v1` (port 18765) loops over `unitedmediadc.com`, `www.`, `api.unitedmediadc.com`, `unitedmedia-group.com`, `www.unitedmedia-group.com` issuing `curl -X PURGE` against localhost with each Host header.

## Key exports
Job: `build-and-deploy` (ubuntu-latest).

## Dependencies
- Internal: root [package.json](../../package.json.md), [turbo.json](../../turbo.json.md); builds [apps/umg](../../apps/umg/README.md)
- External: actions/checkout@v6, actions/setup-node@v6, pnpm/action-setup@v6, SamKirkland/FTP-Deploy-Action@v4.4.0, appleboy/ssh-action@v1

## Used by
GitHub Actions on push/dispatch. The WordPress side triggers it via `POST /repos/{owner}/{repo}/dispatches` (see the headless-config plugins under [plugin/](../../plugin/README.md)).

## Notes
Secrets: `UMG_WP_API_URL`, `UMG_FTP_SERVER/USERNAME/PASSWORD`, `UMG_SSH_HOST/USERNAME/KEY`. Unlike older revisions, no `dangerous-clean-slate` — the FTP action diffs and syncs. The purge step is what makes deploys visible immediately despite SiteGround's full-page cache.

---
*Documented at commit 1cbdce5.*
