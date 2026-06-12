# .github/workflows/deploy-echo-media.yml

**Purpose:** Builds the Echo Media app and deploys its static export to SiteGround (echo-media.info), then purges the SiteGround cache.

## Responsibilities
Same pipeline as [deploy-umg.yml](deploy-umg.yml.md) with these differences:
- **Triggers:** paths `apps/echo-media/**` + `packages/**`; `repository_dispatch` type `deploy-echo-media` — the EM WordPress site fires this on post publish/update/delete, enabling auto-rebuild of the static site when content changes.
- **Build:** `pnpm turbo run build --filter=echo-media` with `NEXT_PUBLIC_WP_API_URL` (secret `EM_WP_API_URL`) and **`NEXT_PUBLIC_API_MODE: wp`** — EM uses the standard WP REST API (`wp/v2/posts`) rather than UMG's custom `um/v1` API.
- **Deploy:** `apps/echo-media/out/` → `./echo-media.info/public_html/` via FTPS.
- **Cache purge:** hosts `echo-media.info`, `www.echo-media.info`, `api.echo-media.info`.

## Key exports
Job: `build-and-deploy` (ubuntu-latest, Node 22, pnpm via `packageManager`).

## Dependencies
- Internal: root [package.json](../../package.json.md), [turbo.json](../../turbo.json.md); builds [apps/echo-media](../../apps/echo-media/README.md)
- External: actions/checkout@v6, actions/setup-node@v6, pnpm/action-setup@v6, SamKirkland/FTP-Deploy-Action@v4.4.0, appleboy/ssh-action@v1

## Used by
GitHub Actions on push/dispatch; the EM headless-config WordPress plugin ([plugin/em-headless-config.php](../../plugin/em-headless-config.php.md)) sends the `repository_dispatch` event.

## Notes
Secrets: `EM_WP_API_URL`, `EM_FTP_SERVER/USERNAME/PASSWORD`, `EM_SSH_HOST/USERNAME/KEY`. Concurrency group `deploy-echo-media` with cancel-in-progress prevents build pileups from rapid post edits.

---
*Documented at commit 1cbdce5.*
