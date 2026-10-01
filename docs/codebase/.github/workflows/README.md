# .github/workflows — overview

CI/CD for the monorepo: one independent deploy workflow per site. Each builds a single app's static export with Turborepo and uploads it to that site's SiteGround `public_html` via FTPS, then makes a best-effort attempt to purge the SiteGround cache over SSH.

## Contents
| Item | Type | Summary |
|------|------|---------|
| [deploy-umg.yml](deploy-umg.yml.md) | file | UMG → unitedmediadc.com (custom `um/v1` API mode) |
| [deploy-echo-media.yml](deploy-echo-media.yml.md) | file | Echo Media → echo-media.info (`API_MODE=wp`, WP auto-rebuild) |
| [deploy-international-spectrum.yml](deploy-international-spectrum.yml.md) | file | International Spectrum → internationalspectrum.org (`API_MODE=wp`, `ARTICLE_META=author`, WP auto-rebuild) |

## Connections
```mermaid
graph LR
  push[push to main] --> wf[deploy-*.yml]
  wpPlugin[WP headless-config plugin<br/>repository_dispatch] --> wf
  wf --> build[pnpm turbo run build --filter=app]
  build --> apps[apps/&lt;app&gt;/out/]
  wf --> sg[SiteGround public_html via FTPS]
  wf --> purge["SSH cache purge<br/>(continue-on-error)"]
```

## Shared pattern
All three: trigger on push to `main` (path-filtered to own app + `packages/**`), `workflow_dispatch`, and `repository_dispatch`; per-app concurrency group with `cancel-in-progress`; ubuntu-latest, **Node 22**, pnpm from `packageManager` (11.5.2), `pnpm install --frozen-lockfile`; `SamKirkland/FTP-Deploy-Action@v4.4.0`; `appleboy/ssh-action@v1` cache purge on port 18765, marked `continue-on-error: true`.

## Differences
| | UMG | Echo Media | Intl Spectrum |
|---|---|---|---|
| API mode | custom (`um/v1`) | `wp` | `wp` |
| Extra env | — | — | `NEXT_PUBLIC_ARTICLE_META: author` |
| WP auto-rebuild dispatch | `deploy-umg` | `deploy-echo-media` | `deploy-international-spectrum` |
| Secret prefix | `UMG_` | `EM_` | `IS_` |

Secrets per site: `*_WP_API_URL`, `*_FTP_SERVER/USERNAME/PASSWORD`, `*_SSH_HOST/USERNAME/KEY`.

## Cache purge is broken — a green run does not mean the cache was flushed
The purge step shells into the account over SSH and loops `curl -X PURGE http://127.0.0.1/*` with a `Host:` header per domain. SiteGround moved the caching nginx off the account's box (~2026-08-29), so the loopback PURGE no longer connects and the step always fails.

Since `1c297ce` the step carries `continue-on-error: true`, so a purge failure cannot mask a real build/FTPS failure. The trade-off: GitHub reports the failed step's **conclusion as `success`**, so the whole run goes green whether or not the cache was flushed. Confirmed in practice on 2026-10-01 — three green runs while all three sites kept serving stale HTML (`x-proxy-cache: HIT`, `last-modified` weeks old) until the cache was flushed by hand.

Until the purge is replaced, flush manually after a deploy: Site Tools → **Speed → Caching → Dynamic Cache**. Tracked as ticket 15 in `claude-context/current-work/ongoing/`.

## Entry points
Push to `main`, manual dispatch from the Actions tab, or a WordPress post change (via the headless-config plugins — see [plugin/](../../plugin/README.md)).

---
*Documented at commit 6e04fee.*
