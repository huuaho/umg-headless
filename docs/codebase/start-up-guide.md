# umg-headless — Startup Guide

How to run the three sites locally, build the static exports, and deploy. Everything below traces to a real file in the repo (cited per item). There is **no Docker setup** in this repo — the apps are static frontends; the WordPress backends are hosted on SiteGround and are consumed remotely even in local dev.

## Prerequisites

| Tool | Version | Source |
|------|---------|--------|
| Node | 22 | `.github/workflows/deploy-*.yml` (`setup-node` `node-version: "22"`); not pinned in `package.json` `engines` or `.nvmrc` |
| pnpm | 11.5.2 | `packageManager` in root [package.json](package.json.md) (corepack/`pnpm/action-setup@v6` read this) |
| turbo | ^2.9.16 | root devDependency — installed by `pnpm install`, no global install needed |

Native build scripts for `sharp` and `unrs-resolver` are pre-approved in [pnpm-workspace.yaml](pnpm-workspace.yaml.md) (`allowBuilds`) — pnpm 10+ blocks install scripts otherwise.

## Environment setup

Each app reads env at **build/dev time** (all vars are `NEXT_PUBLIC_*`, baked into the bundle). Copy `.env.example` into each app as `.env.local` and set:

```bash
# apps/umg/.env.local
NEXT_PUBLIC_WP_API_URL=https://api.unitedmediadc.com/wp-json

# apps/echo-media/.env.local
NEXT_PUBLIC_WP_API_URL=https://api.echo-media.info/wp-json
NEXT_PUBLIC_API_MODE=wp

# apps/international-spectrum/.env.local
NEXT_PUBLIC_WP_API_URL=https://api.internationalspectrum.org/wp-json
NEXT_PUBLIC_API_MODE=wp
NEXT_PUBLIC_ARTICLE_META=author   # optional; IS production sets this (deploy-international-spectrum.yml)
```

| Variable | Purpose | Source |
|----------|---------|--------|
| `NEXT_PUBLIC_WP_API_URL` | WordPress REST base URL per site | `.env.example`, deploy workflows |
| `NEXT_PUBLIC_API_MODE` | `wp` = standard `wp/v2` REST (EM/IS); omit for UMG → defaults to `custom` (`um/v1`) | [packages/api/client.ts](packages/api/client.ts.md), deploy workflows |
| `NEXT_PUBLIC_ARTICLE_META` | `author` shows author names on cards; default shows read time | deploy-international-spectrum.yml |

No other secrets are needed locally — Stripe and Mailchimp credentials live server-side in the WordPress plugins.

## Run locally (development)

```bash
pnpm install                 # once, at repo root
pnpm dev:umg                 # United Media Group  → http://localhost:3000
pnpm dev:em                  # Echo Media          → http://localhost:3000
pnpm dev:is                  # Intl Spectrum       → http://localhost:3000
```

Scripts from root [package.json](package.json.md) (`turbo run dev --filter=<app>`); each app's `dev` is `next dev` (apps' package.json). Hot reload works across `packages/ui`/`packages/api` since apps transpile the shared packages directly. Content is fetched from the live WP backends in the browser, so you need network access; CORS for `localhost` is allowed by the headless-config plugins ([plugin/](plugin/README.md)).

## Build (static export)

```bash
pnpm turbo run build                          # all apps
pnpm turbo run build --filter=umg             # one app
npx serve apps/umg/out/                       # preview the static export locally
```

`next build` with `output: 'export'` + `trailingSlash: true` (each app's `next.config.ts`) emits a fully static site to `apps/<app>/out/`.

## Deploy

Push to `main` — each app deploys independently via its [GitHub Actions workflow](.github/workflows/README.md) when its own files or `packages/**` change (also manual `workflow_dispatch`, and EM/IS auto-rebuild via `repository_dispatch` from WordPress on post changes). Pipeline: Node 22 + pnpm → `turbo run build --filter=<app>` → FTPS upload of `out/` to SiteGround `public_html` → SSH cache purge. Secrets per site (`UMG_`/`EM_`/`IS_` prefixes): `*_WP_API_URL`, `*_FTP_SERVER/USERNAME/PASSWORD`, `*_SSH_HOST/USERNAME/KEY`.

## External services & data

| Service | Role | Notes |
|---------|------|-------|
| WordPress @ api.unitedmediadc.com | UMG backend | Runs [united-media-ingestor](plugin/united-media-ingestor/README.md) (article aggregation, `um/v1`), [umg-photo-contest](plugin/umg-photo-contest/README.md) (`umg/v1`), [umg-newsletter](plugin/umg-newsletter/README.md) |
| WordPress @ api.echo-media.info | EM backend | Standard `wp/v2` + [em-headless-config](plugin/em-headless-config.php.md) |
| WordPress @ api.internationalspectrum.org | IS backend | Standard `wp/v2` + [is-headless-config](plugin/is-headless-config.php.md) |
| Stripe | Photo-contest payment | Payment link in `apps/umg/lib/competitions/current.ts`; webhook handled by the plugin |
| Mailchimp | Newsletter double-opt-in | Server-side in umg-newsletter plugin |

There is no local database or seed step — all content lives in the hosted WordPress sites. The WP plugins themselves are deployed by uploading the `docs/plugin/` folders to each site's `wp-content/plugins/` and activating them (see [plugin/README.md](plugin/README.md)).

## Common commands

```bash
pnpm dev:umg | dev:em | dev:is        # dev servers (root package.json)
pnpm turbo run build [--filter=app]   # static builds (turbo.json)
pnpm turbo run lint                   # eslint per app
pnpm install --frozen-lockfile        # CI-style reproducible install
```

There is no test suite in the repo.

## Troubleshooting

- **CORS errors locally:** the `Access-Control-Allow-Origin` header must exactly match your origin; the headless-config plugins allow `http://localhost:3000`. If production works but localhost fails, SiteGround may be serving cached API responses — the plugins send `Cache-Control: no-cache` on REST responses, but flushing SiteGround's cache (Site Tools → Speed → Caching) clears stuck headers.
- **404/403 on direct URLs of a deployed site:** confirm `trailingSlash: true` in the app's `next.config.ts` (directory-style export that Apache serves without rewrites).
- **Images point at the wrong domain:** WP must define `WP_HOME`/`WP_SITEURL` as the `api.` subdomain, otherwise REST responses embed old-domain upload URLs.

---
*Documented at commit 1cbdce5.*
