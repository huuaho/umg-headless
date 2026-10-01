# umg-headless — Startup Guide

How to run the three sites locally, build the static exports, and deploy. Everything below traces to a real file in the repo (cited per item). There is **no Docker setup** in this repo — the apps are static frontends; the WordPress backends are hosted on SiteGround and are consumed remotely even in local dev.

## Prerequisites

| Tool | Version | Source |
|------|---------|--------|
| Node | 22 | `.github/workflows/deploy-*.yml` (`setup-node` `node-version: "22"`); not pinned in `package.json` `engines` or `.nvmrc` |
| pnpm | 11.5.2 | `packageManager` in root [package.json](package.json.md) (corepack/`pnpm/action-setup@v6` read this) |
| turbo | ^2.10.12 | root devDependency — installed by `pnpm install`, no global install needed |

Native build scripts for `sharp` and `unrs-resolver` are pre-approved in [pnpm-workspace.yaml](pnpm-workspace.yaml.md) (`allowBuilds`) — pnpm 10+ blocks install scripts otherwise. The same file sets `minimumReleaseAge: 10080`, so installs/updates refuse package versions published less than 7 days ago, and security `overrides` for postcss/sharp.

Nothing else is installed globally. The app toolchain is identical across all three `apps/*/package.json`: `next` and `eslint-config-next` pinned exactly to **16.3.4**, `react`/`react-dom` exactly **19.2.8**, plus `typescript` ^6.0.3, `eslint` ^9.39.5, `@types/node` ^22.20.1 and `tailwindcss`/`@tailwindcss/postcss` ^4.3.3.

Three major bumps are held back deliberately — upstream does not support them yet (checked 2026-09-16):

- **`typescript` 6 → 7** — typescript-eslint throws `does not support TS 7.0`; every published version still caps its TS peer at `<6.1.0`.
- **`eslint` 9 → 10** — `eslint-plugin-react@7.37.5` is the newest release and peers at `^9.7`; ESLint 10 removed `context.getFilename()`, which that plugin still calls.
- **`@types/node` 22 → 26** — builds clean, but it should track the Node that CI runs (22), not whatever Node happens to be installed locally.

**After bumping Next, run `pnpm dedupe`.** `packages/ui` declares `next: "*"` as a peer, so pnpm can keep that peer pinned to the previously resolved version and leave two full Next copies in the lockfile — the apps on the new version, the shared packages typechecking against the old one. That is exactly what happened on 16.3.1 → 16.3.4 (commit `db08663`); `pnpm dedupe` in the same commit collapsed them back to a single `next@16.3.4`.

## Environment setup

Each app reads env at **build/dev time** (all vars are `NEXT_PUBLIC_*`, baked into the bundle). `.gitignore` excludes `.env*`, so there is no committed `.env.example` to copy — write each app's `.env.local` by hand:

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
| `NEXT_PUBLIC_WP_API_URL` | WordPress REST base URL per site | [packages/api/client.ts](packages/api/client.ts.md), [packages/api/wp-client.ts](packages/api/wp-client.ts.md), deploy workflows |
| `NEXT_PUBLIC_API_MODE` | `wp` = standard `wp/v2` REST (EM/IS); omit for UMG → defaults to `custom` (`um/v1`) | [packages/api/client.ts](packages/api/client.ts.md), deploy workflows |
| `NEXT_PUBLIC_ARTICLE_META` | `author` shows author names on cards; default shows read time | [packages/api/transformers.ts](packages/api/transformers.ts.md), deploy-international-spectrum.yml |

No other secrets are needed locally — Stripe and Mailchimp credentials live server-side in the WordPress plugins.

## Run locally (development)

```bash
pnpm install                 # once, at repo root
pnpm dev:umg                 # United Media Group  → http://localhost:3000
pnpm dev:em                  # Echo Media          → http://localhost:3000
pnpm dev:is                  # Intl Spectrum       → http://localhost:3000
```

Scripts from root [package.json](package.json.md) (`turbo run dev --filter=<app>`); each app's `dev` is `next dev` (apps' package.json). All three bind `next dev`'s default port 3000, so run one at a time. Hot reload works across `packages/ui`/`packages/api` since apps transpile the shared packages directly.

A dev server needs network access to the live WP backends: page content is fetched by the dev server (async server components), while the client components — search, comments, newsletter signup, and the photo-submission/school/admin flows — fetch from the browser. CORS applies to that second group only, and `http://localhost:3000` is allowed by the headless-config plugins ([plugin/](plugin/README.md)).

## Build (static export)

```bash
pnpm turbo run build                          # all apps
pnpm turbo run build --filter=umg             # one app
npx serve apps/umg/out/                       # preview the static export locally
```

`next build` with `output: 'export'` + `trailingSlash: true` emits a fully static site to `apps/<app>/out/`. UMG sets `output: "export"` unconditionally; EM and IS set it only when `NODE_ENV === "production"` (which `next build` sets), so their `out/` appears on a build and not in dev ([next.config.ts](apps/umg/next.config.ts.md)).

The build makes live API calls, so a first local build wants network access. Beyond fetching the articles themselves, UMG queries the article count of every nav category — [lib/activeCategories.ts](apps/umg/lib/activeCategories.ts.md) asks for `perPage: 1` per category and drops the empty ones from the header/footer nav and the homepage sections. It fails safe: any error, or a result claiming *every* category is empty, returns the full list. An offline build therefore still succeeds — it just ships the complete nav, including categories that have no articles.

## Deploy

Push to `main` — each app deploys independently via its [GitHub Actions workflow](.github/workflows/README.md) when its own files or `packages/**` change (also manual `workflow_dispatch`, and EM/IS auto-rebuild via `repository_dispatch` from WordPress on post changes). Pipeline: Node 22 + pnpm → `turbo run build --filter=<app>` → FTPS upload of `out/` to SiteGround `public_html` → SSH cache purge. Secrets per site (`UMG_`/`EM_`/`IS_` prefixes): `*_WP_API_URL`, `*_FTP_SERVER/USERNAME/PASSWORD`, `*_SSH_HOST/USERNAME/KEY`.

**A green deploy does not mean the cache was flushed.** The "Purge SiteGround cache" step carries `continue-on-error: true` in all three workflows (commit `1c297ce`) because SiteGround moved the caching nginx off the account's box around 2026-08-29 and the in-server loopback `PURGE` now gets connection-refused. `continue-on-error` makes GitHub report the failed step's *conclusion* as `success`, so the run looks entirely clean even when the purge died — confirmed in practice 2026-10-01. Until a replacement purge exists, flush by hand after each deploy: Site Tools → Speed → Caching → Dynamic Cache.

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
- **Images point at the wrong domain:** WP must define `WP_HOME`/`WP_SITEURL` as the `api.` subdomain, otherwise REST responses embed old-domain upload URLs. Note that editing `images.remotePatterns` is not the fix and almost never the cause — `images.unoptimized: true` makes `next/image` skip host validation entirely, so the list is effectively decorative. UMG's list does not even include `api.echo-media.info` or `api.internationalspectrum.org`, which serve nearly every article image, and dropping the `diplomaticwatch.com` entries (commit `12bef08`) changed no output.
- **Build fails with `Expected JSON from … but got text/html: <html>…sgcaptcha…`:** SiteGround's bot protection answered the REST call with an **HTTP 200 whose body is an HTML challenge**, keyed to the caller's IP — so it is not an outage and nothing is misconfigured. [`fetchWpGet()`](packages/api/wp-client.ts.md) already detects the challenge and retries four times (1s/3s/8s backoff), which was not enough on 2026-10-01; re-running the workflow, which lands on a fresh runner IP, cleared it. Locally, retrying later or from another network has the same effect.

---
*Documented at commit 6e04fee.*
