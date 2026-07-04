# Plugin Migration — Conversion Scaffold

> Intent: per-plugin conversion maps for retiring the WordPress plugins onto
> the custom backend (Supabase/Postgres + edge functions), per
> [`../../custom-backend-architecture.md`](../../custom-backend-architecture.md).
> These are scaffolds — endpoint-by-endpoint "what becomes what" — not full
> designs. Security designs for the contest items live in
> [`../../remediation/payment-deferred-custom-backend.md`](../../remediation/payment-deferred-custom-backend.md).
>
> **Status: NOT SCHEDULED.** Executes only on the architecture doc's §7
> triggers. Endpoint inventory verified against `docs/plugin/` 2026-07-04.

## The plugins, sized

| Doc | Plugin | Runs on | Conversion effort |
| --- | --- | --- | --- |
| [umg-photo-contest.md](umg-photo-contest.md) | `umg-photo-contest` (27 REST routes) | UMG WP | **~2–3 weeks** — the big one |
| [united-media-ingestor.md](united-media-ingestor.md) | `united-media-ingestor` (1 public route + cron pipeline) | UMG WP | **~1 week** |
| [headless-config.md](headless-config.md) | `em-headless-config.php`, `is-headless-config.php` | EM / IS WP | **~half day** — near-pure deletion |
| [umg-newsletter.md](umg-newsletter.md) | `umg-newsletter` (1 route, Mailchimp proxy) | UMG WP | **~half day** |
| [data-migration.md](data-migration.md) | — (ETL: WP MySQL → Postgres, uploads → buckets) | — | **~3–5 days** incl. dry runs |
| [secrets.md](secrets.md) | — (credential inventory: what moves, what gets revoked/rotated per phase) | — | checklist, runs alongside each phase |

## Shared primitives (build once, referenced by every doc)

- **Auth**: Supabase Auth email OTP replaces `jwt.php` + `auth.php` wholesale
  (hashed codes, attempt limits, rate limits, non-enumeration built in —
  retires audit items I-6/I-9). Roles via `memberships (user_id, brand, role)`
  + RLS, replacing WP roles/capabilities (`roles.php`).
- **Storage**: two buckets — `public-media` (contest photos, article images)
  and `private-documents` (student proofs; signed-URL access only, retires
  I-7). DB stores keys, never URLs.
- **CORS**: platform-managed; every plugin's `cors.php` is deleted, no
  replacement written.
- **Rate limiting**: platform (auth) + a small `rate_limit_events` table for
  custom endpoints (see remediation doc preamble).
- **Rebuild/revalidate**: publish events call Next.js on-demand revalidation
  (or `repository_dispatch` while frontends remain static).

## Conversion order

Phase numbers across this folder follow the architecture doc's "Migration
order": **1** articles, **2** frontends → Vercel, **3** contest, **4** editor,
**5** decommission.

- **Phase 1:** shared primitives + `articles` schema → **ingestor** (read
  path, parallel-runnable via the existing `API_MODE` switch in
  `packages/api`).
- **Phase 3:** **photo-contest**, between contest seasons, with the
  remediation designs applied (I-4, I-6, I-7, I-9, I-10) and the
  three-account test matrix re-verified before DNS cutover.
- **Unnumbered:** **newsletter** is independent — convert anytime, even
  first, as a pilot of the edge-function pattern. **headless-config**
  deletions ride along with whatever moves EM/IS content (phase 1 for reads,
  phase 4 for writes). [data-migration.md](data-migration.md) and
  [secrets.md](secrets.md) run per phase, not all at once.

## Cutover rules (apply to every plugin)

- Parallel-run reads where possible; A/B against the WP endpoint before
  switching the frontend.
- Never cut over payments mid-season; the Stripe webhook must be dual-listened
  (both endpoints registered in Stripe) during the switch window.
- Each WP plugin stays installed-but-idle for one season after cutover, then
  is removed; SiteGround hosting is not cancelled until final media export is
  verified (architecture doc §3).

## Staleness convention

Every doc in this folder ends with a **"Plan based on codebase at commit
`<sha>`"** stamp. When a plugin gains a feature, a new plugin appears, or a
deploy workflow changes, the stamps show at a glance that these plans predate
the change and must be re-verified before execution. When updating a plan,
re-verify its claims against the code and advance its stamp to the current
commit.

---
*Plan based on codebase at commit `27a1dfc` (2026-07-04). If plugins, deploy
workflows, or providers have changed since, re-verify before executing.*
