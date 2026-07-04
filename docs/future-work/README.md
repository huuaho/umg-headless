# Future Work

Tracked issues and improvements that are known but not yet actioned (or only
partially actioned). Each doc states, per issue, whether it is being fixed now
or deferred — and why.

- [ROADMAP.md](ROADMAP.md) — 🗺️ **living doc**: the zoomed-out priority view of
  everything below (deadline first, then ease × value). Start here; update it
  when any item ships or unblocks.
- [custom-backend-architecture.md](custom-backend-architecture.md) — decided
  target architecture for the WP → Postgres (Supabase) migration + Vercel/ISR
  frontend move. **Not scheduled** — executes only on the triggers listed in
  its §7. Supersedes `claude-context/custom-backend-plan.md`.
- [alipay-incident-log.md](alipay-incident-log.md) — 🔴 **open incident**: running
  log of the Alipay payment outage (fails ~100% since Jun 30 with
  `partner_payment_not_found`) and the Stripe Support correspondence. Root cause
  unconfirmed; escalation to Stripe's payments infra team pending.
- [payment-pipeline-audit.md](payment-pipeline-audit.md) — full audit of the
  photo-competition auth + payment pipeline (WordPress plugin + Next.js
  frontend). Covers functional bugs, security, and privacy. Records which items
  are being fixed in the plugin now and which are deferred to the planned
  custom-backend migration.

## Remediation breakdowns (`remediation/`)

Detailed, step-by-step "how to fix" docs. Payment ones map to the audit's issue
IDs (I-2, I-3, …); the others break down the pre-existing `claude-context/`
future work.

- [remediation/payment-fix-now.md](remediation/payment-fix-now.md) — exact
  before/after code for the three functional fixes (I-2 `client_reference_id`
  binding, I-3 stale "check payment" button, I-5 webhook logging), with a Stripe
  test-mode verification plan and commit ordering. **✅ Shipped 2026-07-02**
  (commit `f4c4cca`, deployed + verified live), together with the I-11 webhook
  purpose gate.
- [remediation/payment-deferred-custom-backend.md](remediation/payment-deferred-custom-backend.md)
  — Node/Postgres designs for the deferred security/privacy items (I-4, I-6, I-7,
  I-9, I-10), with a migration checklist.
- [remediation/aeo-remaining-work.md](remediation/aeo-remaining-work.md) — open
  AEO/SEO items from `claude-context/` (OG image, GA4/Search Console, EM/IS
  rollout, NewsArticle schema, llms.txt, social profiles).
- [remediation/future-features-breakdown.md](remediation/future-features-breakdown.md)
  — the larger `future-features.md` roadmap, reconciled against what's already
  shipped.

## Cross-cutting findings (surfaced while writing the above)

Several tracked tickets are **stale** — already done or wrong about repo state:

- **Art Submission System + entry-fee payment** (in `future-features.md`) are
  **already shipped** as the live photo contest — strike from the roadmap. Only
  donations remain as an add-on.
- **Judge/admin scoring dashboard is NOT built** — `judges-panel` is public bios
  only; there are no `/admin/*` routes or judging endpoints. This is the real
  open half of the "auth + submission" feature.
- **AEO ticket 10** (analytics) lists "do sitemap first" as its blocker, but
  `apps/umg/app/sitemap.ts` + `robots.ts` are already live — it's code-unblocked,
  only waiting on the Google account decision (Q3).
- **AEO ticket 09** (OG image) — nothing is broken; OG/Twitter already point at a
  real venue photo. It's an asset upgrade, not a fix.
- **EM/IS article pages** already emit article-level OG/Twitter; what's missing is
  JSON-LD, Organization schema, sitemap/robots, and Footer socials. No shared
  `packages/ui/JsonLd` helper exists yet (UMG hand-rolls it in ~4 files).
