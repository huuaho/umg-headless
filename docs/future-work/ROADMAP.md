# Roadmap — Living Priority Doc

> **Living doc.** The single zoomed-out view of everything planned, ordered by
> deadline first, then feasibility (ease ÷ value). Each item links to its real
> plan doc — this file holds priorities and status only, no designs.
>
> **Maintenance:** update the status column when an item ships/unblocks, move
> it to Done, and advance the stamp at the bottom. If the stamp is older than
> the docs it links to, this file is stale — reconcile before trusting it.

Effort key: XS < S < M < L < XL.

---

## Now — deadline-bound or in-flight

| # | Item | Deadline / driver | Effort | Status | Plan doc |
| --- | --- | --- | --- | --- | --- |
| 1 | **Judge panel feedback iteration** | ⏰ **mid-Aug 2026** (jury Sept 1) | M | Parked awaiting client answers (5 UX questions) | [`claude-context/paused-work/judge-panel-parked.md`](../../claude-context/paused-work/judge-panel-parked.md) |
| 2 | Judge diff code review + docs sync | rides with #1 | S | Never run | same doc, "engineering follow-ups" |
| 3 | **Alipay outage** | open incident | — (Stripe-side) | Escalated to Stripe; UnionPay/card workaround live | [`alipay-incident-log.md`](alipay-incident-log.md) |
| 4 | School bulk-reg leftovers (`school.php` redeploy, polish commit, review, docs) | none — just finish it | S | Shipped 2026-07-03, cleanup pending | `claude-context/finished-work/bulk-registration/` |

## Next — unblocked, cheap, high value-per-effort

Ordered by ease × value; slot between "Now" items.

| # | Item | Effort | Why now | Plan doc |
| --- | --- | --- | --- | --- |
| 5 | **UMG homepage build-time articles + scheduled rebuild** | S (~1 day) | Closes the AI-crawler invisibility hole (homepage ships skeletons today) — biggest AEO win, no migration needed | [`custom-backend-architecture.md`](custom-backend-architecture.md) §8 |
| 6 | **WP auth hardening lite** (longer codes, attempt counter, throttle) | S | Worst audit items (I-6/I-9 = account takeover, mailbombing) shouldn't wait a year for migration | [`custom-backend-architecture.md`](custom-backend-architecture.md) §8; full designs in [`remediation/payment-deferred-custom-backend.md`](remediation/payment-deferred-custom-backend.md) |
| 7 | Shared `JsonLd` helper (`packages/ui`) | S | Step 0 that unblocks all EM/IS schema work; UMG hand-rolls it in 4 places | [`features/em-is-aeo-rollout.md`](features/em-is-aeo-rollout.md) |
| 8 | Donations (second Stripe Payment Link + `purpose` metadata) | XS | Webhook gate already shipped (I-11); minutes of work if client wants it | [`features/donations.md`](features/donations.md) |
| 9 | `llms.txt` + OG share image upgrade | XS | Trivial, code-only | [`features/llms-txt.md`](features/llms-txt.md), [`features/og-share-image.md`](features/og-share-image.md) |
| 10 | EM/IS AEO rollout (schema, sitemap/robots, Article JSON-LD) | M | Ports finished UMG work; needs #7 first | [`features/em-is-aeo-rollout.md`](features/em-is-aeo-rollout.md), [`features/em-is-article-schema.md`](features/em-is-article-schema.md) |

## Waiting — blocked on external answers (not our move)

| Item | Blocked on | Effort once unblocked | Plan doc |
| --- | --- | --- | --- |
| GA4 + Search Console | Google account decision (client, Q3) | S — code already env-guarded | [`features/analytics-search-console.md`](features/analytics-search-console.md) |
| Social profiles rollout | Handle sign-off; EM/IS have **no handles at all** | XS code; editorial-heavy | [`features/social-profiles.md`](features/social-profiles.md) |
| EM category overhaul | Final category list from EM team | S — mechanical | [`features/em-category-overhaul.md`](features/em-category-overhaul.md) |
| **Email question** (does anyone read SiteGround mailboxes?) | one client conversation — **ask now, costs nothing** | — | [`custom-backend-architecture.md`](custom-backend-architecture.md) §9 Q1 |
| Content standards + social bios | editorial-owned, ongoing | no dev | `claude-context/current-work/ongoing/12`, `13` |

## Later — trigger-gated (decided, designed, deliberately not scheduled)

**Custom backend migration** — architecture settled, plugin conversions
scaffolded, costed (~$50/mo, ≈ wash vs today; real cost is 6–9 weeks dev
effort). Executes **only** when one of three triggers fires
([`custom-backend-architecture.md`](custom-backend-architecture.md) §7):

1. **Client funds the EM/IS editor** → most likely trigger. Standing
   decision: the editor is **never built on WP**
   ([`features/em-is-post-editor.md`](features/em-is-post-editor.md) §2.1);
   funding it starts the migration.
2. **Contest outgrows the plugin** → migrate between seasons.
3. **Real WP/SiteGround operational failure.**

Inside the migration (in phase order — see
[`features/plugin-migration/`](features/plugin-migration/)): articles/ingestor
→ frontends to Vercel/ISR → contest (+ security items I-4…I-10, mostly retired
by platform) → editor → decommission WP/SiteGround.

Behind the editor: **social auto-post**
([`features/social-auto-post.md`](features/social-auto-post.md)) — XL chain's
caboose, do not start sooner.

## Done (recent, for context)

- School bulk-registration — shipped 2026-07-03 (cleanup = #4)
- Judge panel v1 — live 2026-07-04 (iteration = #1)
- Payment fix-now set (I-2, I-3, I-5, I-11) — shipped 2026-07-02
- AEO sprints 1–2 (schema, OG, H1, sitemap/robots, FAQ) — see
  `claude-context/finished-work/`
- Backend-migration deep-dive: architecture + plugin scaffolds + secrets
  inventory — 2026-07-04 (docs only; execution trigger-gated)

---
*Priorities as of commit `27a1dfc` (2026-07-04). Living doc — advance this
stamp whenever statuses change.*
