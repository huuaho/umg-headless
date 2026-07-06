# Secrets Inventory — What Exists, Where It Moves, What Gets Revoked

> Every credential the migration touches: where it lives today (WP config,
> SiteGround, GitHub Actions), where it lives after (Supabase/Vercel/edge
> function config), and what must be **revoked or rotated** at each phase.
> Names verified against the actual workflows and plugin configs.
>
> Standing rule (architecture doc §9): all service accounts are
> **client-owned**; dev is invited as collaborator. No secret ever ships in
> `NEXT_PUBLIC_*` env vars or frontend bundles.

## 1. Today's inventory

### GitHub Actions secrets (repo settings)

Per site (UMG shown; EM/IS have equivalents in their `deploy-*.yml`):

| Secret | Used by | Purpose |
| --- | --- | --- |
| `UMG_FTP_SERVER` / `UMG_FTP_USERNAME` / `UMG_FTP_PASSWORD` | deploy workflow | FTPS upload to SiteGround `public_html/` |
| `UMG_SSH_HOST` / `UMG_SSH_USERNAME` / `UMG_SSH_KEY` | deploy workflow | SiteGround cache purge over SSH (port 18765) |
| `UMG_WP_API_URL` (+ EM/IS API URLs) | build env | not really secret (public API base), stored as secret anyway |

### WP `wp-config.php` constants (per install, on SiteGround)

| Constant | Install | Purpose | Notes |
| --- | --- | --- | --- |
| `UMGPC_JWT_SECRET` | UMG | HMAC key for the hand-rolled JWT | ⚠️ **falls back to WP `AUTH_KEY`** if undefined (`umg-photo-contest/includes/config.php:17-18`) — if the fallback is in effect, the WP salt doubles as the app JWT key |
| `UMGPC_STRIPE_SECRET_KEY` | UMG | school checkout (Stripe API, sk_live) | |
| `UMGPC_STRIPE_WEBHOOK_SECRET` | UMG | webhook signature verification (whsec) | distinct from the API key |
| `MAILCHIMP_API_KEY` / `MAILCHIMP_LIST_ID` / `MAILCHIMP_SERVER_PREFIX` | UMG | newsletter proxy | list ID / prefix are low-sensitivity |
| `GH_REBUILD_TOKEN` | EM + IS | GitHub PAT firing `repository_dispatch` rebuilds | a **GitHub credential stored inside WordPress** — scoped PAT, but lives on shared hosting |
| WP `DB_PASSWORD`, `AUTH_KEY`/salts | all 3 | WordPress itself | die with the installs |

### SiteGround-level credentials

- Site Tools / client-area login (client-owned)
- SSH keys enrolled for the deploy workflows (same keys as `*_SSH_KEY`)
- FTP accounts for the deploy workflows
- MySQL DB users; **Remote MySQL allowlist** (only opened temporarily for the
  ETL — see [data-migration.md](data-migration.md))
- Email mailbox passwords (if client email is on SiteGround — architecture doc §9 Q1)

### Stripe (client dashboard)

- Live secret key + webhook signing secret (mirrored into WP constants above)
- Payment Link URLs (public), publishable key (public)

## 2. End-state inventory

| Secret | Lives in | Consumed by |
| --- | --- | --- |
| Supabase `service_role` key | edge-function config ONLY | server-side privileged ops — **never** in Vercel env reachable by frontend code paths that ship client-side |
| Supabase anon key + project URL | Vercel env (public by design; RLS is the guard) | supabase-js in the frontends |
| Supabase DB password / JWT secret | Supabase dashboard (platform-managed) | — |
| `STRIPE_SECRET_KEY` | edge-function secrets | checkout + API calls |
| `STRIPE_WEBHOOK_SECRET` (**new value** — new endpoint = new signing secret) | edge-function secrets | webhook verification |
| `MAILCHIMP_API_KEY` (+ list/prefix) | edge-function secrets | newsletter proxy |
| `RESEND_API_KEY` (if adopted for transactional mail) | edge-function secrets | emails beyond Supabase Auth's own |
| Revalidate token (Vercel bypass token or `repository_dispatch` PAT while frontends are static) | edge-function secrets | publish → revalidate/rebuild |
| Vercel deploy auth | GitHub↔Vercel app integration | replaces all FTP/SSH deploy secrets |

Gone entirely: JWT signing key (platform-managed sessions), CORS config,
FTP/SSH deploy credentials, WP DB credentials, `GH_REBUILD_TOKEN`-in-WP.

## 3. Revocation / rotation checklist, per phase

Phase numbers follow the architecture doc's "Migration order" (1 articles,
2 frontends, 3 contest, 4 editor, 5 decommission). The newsletter is
independent and unnumbered — its steps run whenever it converts.

**Phase 1 (ingestor → Postgres):**
- [ ] Open Remote MySQL allowlist for the ETL IP only; **remove the allowlist
      entry when the backfill is done** (don't leave `%` standing)
- [ ] New: Supabase project keys created (client account)

**Phase 2 (frontends → Vercel):**
- [ ] Delete all 3 sites' `*_FTP_*` and `*_SSH_*` GitHub Actions secrets once
      `deploy-*.yml` are removed
- [ ] Remove the deploy SSH keys and FTP accounts in SiteGround Site Tools
- [ ] Revoke `GH_REBUILD_TOKEN` PAT **after** EM/IS publish flows point at
      revalidation instead of `repository_dispatch` (EM/IS keep using it until
      then — sequencing matters)

**Phase 3 (contest → backend, between seasons):**
- [ ] Add webhook endpoint in Stripe for the edge function → new `whsec`;
      dual-listen window; then **delete the WP endpoint from Stripe** and blank
      `UMGPC_STRIPE_WEBHOOK_SECRET` / `UMGPC_STRIPE_SECRET_KEY` in `wp-config.php`
- [ ] **Rotate the Stripe secret key** after the WP copy is removed — it has
      lived on shared hosting; treat as exposed-adjacent
- [ ] `UMGPC_JWT_SECRET` dies with the plugin; if it was the `AUTH_KEY`
      fallback, rotate the WP salts on any install that outlives this phase

**Newsletter conversion (independent, anytime):**
- [ ] Move `MAILCHIMP_API_KEY` (+ list ID / server prefix) to function
      secrets; blank the WP constants

**Phase 5 — decommission (per WP install, then SiteGround):**
- [ ] Final snapshot taken ([data-migration.md](data-migration.md)) — dump is
      itself sensitive (PII + hashes): store encrypted, client-side
- [ ] Delete WP admin users / application passwords; deactivate install
- [ ] SiteGround: remove remaining SSH keys, FTP accounts, MySQL remote
      entries; cancel plan only after the email question (§9 Q1) is resolved

## 4. Principles

- **New home = new value** where the platform allows it (webhook secrets,
  PATs): revoke-and-reissue beats copy-paste, and Stripe forces it anyway.
- Anything that has lived in `wp-config.php` on shared hosting gets rotated at
  migration, not copied forward.
- One secrets manager per layer (GitHub App for deploys, Supabase function
  secrets for server code, Vercel env for build/public config) — no secret in
  two places, which is the current state (Stripe keys in both dashboard and WP).

---
*Plan based on codebase at commit `adb65a1` (2026-07-04). If plugins, deploy
workflows, or providers have changed since, re-verify before executing.*
