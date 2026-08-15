# plugin — overview

WordPress plugin **source code** that lives (unusually) under `docs/plugin/` in this repo and is deployed to the headless WordPress backends — it is not part of the Next.js build. Three full plugins run on api.unitedmediadc.com (UMG), and two standalone single-file config plugins run on the Echo Media and International Spectrum backends. Together they provide every custom REST route the frontends call, plus CORS/caching/redirect config and auto-rebuild webhooks.

## Contents
| Item | Type | Summary |
|------|------|---------|
| [united-media-ingestor/](united-media-ingestor/README.md) | folder | Article aggregator for UMG: ingests three source sites into a local `um_article` store, serves `GET /um/v1/articles`; also embeds UMG's headless config |
| [umg-photo-contest/](umg-photo-contest/README.md) | folder | Photo competition backend: email-code auth + JWT, Stripe payment webhook (individual + school batch), draft/photo uploads, submit/un-submit, school bulk registration + combined checkout, capability-gated judge panel API (`/umg/v1/*`) |
| [umg-newsletter/](umg-newsletter/README.md) | folder | Mailchimp subscribe proxy: `POST /umg/v1/subscribe` (double opt-in, rate-limited) |
| [em-headless-config.php](em-headless-config.php.md) | file | Echo Media backend config: CORS, REST no-cache, 301 front-end redirect, GitHub `deploy-echo-media` dispatch on post changes |
| [is-headless-config.php](is-headless-config.php.md) | file | International Spectrum backend config: CORS, no-cache, `deploy-international-spectrum` dispatch, `video_url` meta + `author_display_name` REST field (redirect currently disabled) |

The older hand-written plugin docs that used to sit alongside the source (`headless-config-plugins.md`, `umg-photo-contest.md`, `umg-newsletter.md`, `united-media-ingestor/QUICK-START.md`) were removed in commit `49d0860`; the per-file docs in this mirror are now the only plugin documentation. A few per-file docs still say "the old plugin doc claimed X" — that refers to those deleted files.

## Connections
```mermaid
graph LR
  subgraph api.unitedmediadc.com
    umi[united-media-ingestor/]
    contest[umg-photo-contest/]
    news[umg-newsletter/]
  end
  subgraph other backends
    em[em-headless-config.php<br/>api.echo-media.info]
    is[is-headless-config.php<br/>api.internationalspectrum.org]
  end
  client[packages/api/client.ts] -->|GET /um/v1/articles + wp/v2| umi
  client -->|wp/v2 posts| em
  client -->|wp/v2 posts, video_url| is
  umgauth[apps/umg/lib/auth/api.ts] -->|/umg/v1 auth, draft, submit/unsubmit| contest
  umgschool[apps/umg/lib/school/api.ts] -->|/umg/v1/school/*| contest
  umgjudge[apps/umg/lib/judging/api.ts] -->|/umg/v1/admin/*| contest
  footer[packages/ui/NewsletterSignup.tsx] -->|POST /umg/v1/subscribe| news
  umi -->|fetches wp/v2| sources[(echo-media, internationalspectrum,<br/>diplomaticwatch source sites)]
  contest --> stripe[(Stripe)]
  news --> mailchimp[(Mailchimp)]
  em -->|repository_dispatch| gha[.github/workflows/deploy-*.yml]
  is -->|repository_dispatch| gha
  news -.CORS defers to.-> contest
```

## Entry points
- **Plugin bootstraps:** [united-media-ingestor/united-media-ingestor.php](united-media-ingestor/united-media-ingestor.php.md), [umg-photo-contest/umg-photo-contest.php](umg-photo-contest/umg-photo-contest.php.md), [umg-newsletter/umg-newsletter.php](umg-newsletter/umg-newsletter.php.md); the two `*-headless-config.php` files are self-contained plugins.
- **Full custom REST surface:**
  - `um/v1`: `GET /articles` (public — aggregated article feed).
  - `umg/v1`: `POST /subscribe` (public, rate-limited); `POST /auth/request-code`, `POST /auth/verify-code` (public); `POST /stripe-webhook` (Stripe-signature); `GET /me`, `GET /payment-status`, `GET /draft`, `PUT /draft`, `POST /draft/photo`, `DELETE /draft/photo/{id}`, `POST /draft/student-proof`, `DELETE /draft/student-proof`, `POST /draft/retitle`, `POST /submit`, `POST /unsubmit` (Bearer JWT, individual flow); `GET/POST /school/applications`, `GET/PUT/DELETE /school/application/{id}`, `POST /school/application/{id}/photo`, `DELETE /school/application/{id}/photo/{mediaId}`, `POST /school/application/{id}/submit`, `POST /school/application/{id}/unsubmit`, `POST /school/application/{id}/retitle`, `POST /school/checkout` (Bearer JWT, school flow); `GET /admin/submissions`, `GET /admin/submissions/{id}`, `PUT /admin/submissions/{id}/score`, `GET /admin/results` (Bearer JWT + `umgpc_judge_submissions` / `umgpc_admin_results` capability — judge panel). Full breakdown in [umg-photo-contest/README.md](umg-photo-contest/README.md).
  - The frontends also use core `wp/v2` on each backend (posts, categories, media), augmented on IS by `video_url` meta and `author_display_name`.
- **Cron hooks:** ingestor `um_cron_incremental` (5 min), `um_cron_backfill` (15 min), `um_cron_server_backfill` (1 min while active); photo contest `umgpc_cleanup_orphaned_drafts` (weekly).
- **Webhooks in:** Stripe → `/wp-json/umg/v1/stripe-webhook`. **Webhooks out:** EM/IS post changes → GitHub `repository_dispatch` consumed by [.github/workflows/](../.github/workflows/README.md).
- **Deployment:** files are uploaded to each backend's `wp-content/plugins/` (the former `docs/plugin/headless-config-plugins.md` install guide was removed; see each plugin's README here); secrets (`GH_REBUILD_TOKEN`, Mailchimp keys, `UMGPC_STRIPE_WEBHOOK_SECRET`, `UMGPC_STRIPE_SECRET_KEY`, `UMGPC_JWT_SECRET`) live in each site's `wp-config.php`, never in this repo. Judge accounts are provisioned in wp-admin (role "Contest Judge"), and blind judging is a WP option (`umgpc_blind_judging`) — no code change needed for either.
- **wp-admin surface (photo contest):** Tools → Retitle Submissions (`manage_options`); "Photo Contest" CPT menu for reviewing entries.

---
*Documented at commit bde729d.*
