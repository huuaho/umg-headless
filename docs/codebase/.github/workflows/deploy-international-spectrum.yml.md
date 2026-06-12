# .github/workflows/deploy-international-spectrum.yml

**Purpose:** Builds the International Spectrum app and deploys its static export to SiteGround (internationalspectrum.org), then purges the SiteGround cache.

## Responsibilities
Same pipeline as [deploy-umg.yml](deploy-umg.yml.md) with these differences:
- **Triggers:** paths `apps/international-spectrum/**` + `packages/**`; `repository_dispatch` type `deploy-international-spectrum` (sent by the IS WordPress site on post changes for auto-rebuild).
- **Build:** `pnpm turbo run build --filter=international-spectrum` with `NEXT_PUBLIC_WP_API_URL` (secret `IS_WP_API_URL`), **`NEXT_PUBLIC_API_MODE: wp`** (standard WP REST API), and **`NEXT_PUBLIC_ARTICLE_META: author`** — IS shows author names on article cards instead of the default read-time.
- **Deploy:** `apps/international-spectrum/out/` → `./internationalspectrum.org/public_html/` via FTPS.
- **Cache purge:** hosts `internationalspectrum.org`, `www.internationalspectrum.org`, `api.internationalspectrum.org`.

## Key exports
Job: `build-and-deploy` (ubuntu-latest, Node 22, pnpm via `packageManager`).

## Dependencies
- Internal: root [package.json](../../package.json.md), [turbo.json](../../turbo.json.md); builds [apps/international-spectrum](../../apps/international-spectrum/README.md)
- External: actions/checkout@v6, actions/setup-node@v6, pnpm/action-setup@v6, SamKirkland/FTP-Deploy-Action@v4.4.0, appleboy/ssh-action@v1

## Used by
GitHub Actions on push/dispatch; the IS headless-config WordPress plugin ([plugin/is-headless-config.php](../../plugin/is-headless-config.php.md)) sends the `repository_dispatch` event.

## Notes
Secrets: `IS_WP_API_URL`, `IS_FTP_SERVER/USERNAME/PASSWORD`, `IS_SSH_HOST/USERNAME/KEY`. The `NEXT_PUBLIC_ARTICLE_META: author` flag is unique to this workflow.

---
*Documented at commit 1cbdce5.*
