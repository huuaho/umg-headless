# Custom Backend — Target Architecture & Migration Triggers

> Intent: the decided-but-not-scheduled architecture for replacing WordPress with
> a Postgres-centric backend, plus the frontend hosting change that pairs with
> it. Supersedes the early notes in `claude-context/custom-backend-plan.md`
> (which contains one factual error, corrected below). Written 2026-07-04 after
> a deep-dive verified against the live infrastructure.
>
> **Status: DECISION RECORDED, DELIBERATELY NOT SCHEDULED.** Execution waits on
> a forcing trigger (§7). Do not let this inflate back into a project without
> one. The "do now" items in §8 are the only near-term work.

---

## 1. Current state (verified 2026-07-04)

- **All three frontends are static exports on SiteGround**, deployed by
  `.github/workflows/deploy-*.yml` (FTPS upload to `public_html/` + SSH cache
  purge). `output: "export"` in every `next.config.ts`.
- **Three WP installs we operate**: `api.unitedmediadc.com` (plugins:
  `united-media-ingestor`, `umg-photo-contest`, `umg-newsletter`),
  `api.echo-media.info` (`em-headless-config`), `api.internationalspectrum.org`
  (`is-headless-config`). Diplomatic Watch is external, read-only.
- **The ingestor already simulates a shared multi-brand DB**: cron pulls
  EM/IS/DW REST every 5 min into a private `um_article` CPT keyed by
  `um_source_site`; UMG frontend reads the unified `um/v1/articles` endpoint.
  Images are hotlinked, not copied.
- **Rebuild chain**: EM/IS WP fire `repository_dispatch` on publish → full site
  rebuild → FTPS. UMG has **no** auto-rebuild; its homepage sections are
  client-rendered instead (see §5 — this is an AEO hole).
- **Contest pipeline** (auth, drafts, photos, proofs, Stripe, judging, school
  batches) lives in the `umg-photo-contest` plugin; deferred security items are
  specced in [`remediation/payment-deferred-custom-backend.md`](remediation/payment-deferred-custom-backend.md)
  (I-4, I-6, I-7, I-9, I-10).

## 2. Target architecture

**One Supabase project (Postgres) + thin edge functions; frontends on Vercel
with ISR; SiteGround reduced to domains/DNS/email.**

### Database: one Postgres DB, brand-scoped — not per-site databases

- `articles` with a `brand` column (`echo-media`, `international-spectrum`,
  `diplomatic-watch`). UMG queries all brands; EM/IS filter their own. This
  makes real what the ingestor CPT already simulates.
- One `users` table + `memberships (user_id, brand, role)` — **no per-site
  admin databases**. Row-level security enforces brand/role scoping at the DB
  layer (EM editors touch only EM rows; judges get a PII-stripped view for
  blind judging).
- Contest: `entries`, `entry_photos`, `entry_documents`, `entry_consents`,
  `transactions` — Postgres mapping already specced in the remediation doc.
- Files in object storage (Supabase Storage), DB stores keys only. **Two
  buckets**: public (contest photos, article images) and private
  (student proofs — minors' PII, signed-URL access only; resolves I-7).

### Division of labor: Postgres/platform vs code

Platform owns (no server code): all reads via PostgREST + RLS; full-text
search (`tsvector`, replaces `WP_Query 's'`); **auth via Supabase email OTP** —
hashed codes, attempt limits, rate limits, non-enumerating responses built in,
which retires I-6 and I-9 wholesale; integrity constraints (one entry per
person, FK cascades); `pg_cron` scheduling.

Edge functions own (thin, ~5 functions): Stripe checkout + webhook signature
verification (port of `payment.php`/`school.php`); transactional submit
validation (I-4 — business rules stay in TypeScript, not plpgsql); DW import
fetcher (port of `incremental.php`, cron-triggered); rebuild/revalidate
dispatch on publish.

**Rule that keeps this maintainable:** RLS/constraints for *authorization and
integrity*; edge functions for *behavior*. No contest rules in plpgsql
triggers.

### Frontends: Vercel + ISR (decided with eyes open, see §5)

- EM/IS article pages → ISR with on-demand revalidation on publish. Replaces
  the entire repository_dispatch → Actions → FTPS chain; publishes appear in
  seconds; build cost stops growing with the archive.
- UMG homepage/category sections → converted from client-fetch
  (`CategorySectionWrapper` is `"use client"`) to server-rendered. **Biggest
  single AEO win available** — today the static build ships skeletons only.
- Authed app surfaces (photo submission, judge panel, school registration)
  stay client-rendered; they shouldn't be indexed.
- `images.unoptimized: true` can be dropped (Vercel image optimization).

## 3. SiteGround: what it offers, what it can't, end-state role

Offers (verified): full SSH/SFTP, Git repos, WP-CLI/Composer, cron, staging
(GrowBig+, WP only), PHP manager, unlimited MySQL DBs (1 GB cap each), Nginx
dynamic cache + CDN, daily backups, email hosting.

Hard limits: **no Node.js on shared/cloud plans** (official KB), no Postgres,
no object storage/upload API, no serverless/ISR.

**Correction to the old plan doc:** SiteGround MySQL **is** remotely
accessible — Site Tools → MySQL → Remote, IP allowlist, port 3306. Useless as
a primary DB (MySQL, 1 GB, no RLS) but **valuable as the migration tap**: ETL
scripts read WP tables directly to seed Postgres instead of paging REST.

End-state role: domains + DNS (+ email, pending §9 Q1). Do not cancel hosting
until WP installs are decommissioned **and** `wp-content/uploads/` (contest
photos, student proofs) is migrated to object storage.

## 4. Why not stay all-in-one on WP?

WP is everything-in-one-box only when the frontend is also WP. Headless was
the decision that split the architecture; everything painful lives on that
seam (CORS, rebuild chain, ingestor-as-fake-shared-DB, hand-rolled JWT, public
Media Library holding minors' PII). Supabase is the modern equivalent of the
one-box (DB + auth + storage + functions in one project); Vercel exists only
because the frontend layer is first-class here. End state has *fewer* moving
parts than today.

## 5. AEO note (why non-static doesn't hurt it)

Crawlers/AI engines need complete HTML from a plain GET — *server* rendering
provides that whether it happens at build time (static) or request time (ISR).
ISR output is byte-equivalent to the static export. What hurts AEO is
*client*-side rendering — which is what UMG's homepage does **today**. Moving
off static is an AEO gain here, not a loss.

## 6. Costs (verified pricing, 2026-07)

| | Today | End state |
|---|---|---|
| SiteGround | ~$25–45/mo | $0 (or ~$15–20/mo if kept for email) |
| Vercel Pro | — | $20/mo (Hobby tier prohibits commercial use) |
| Supabase Pro | — | $25/mo (free tier: no backups, pauses when idle — dev only) |
| Transactional email (Resend) | — | $0–20/mo (free 3k/mo covers auth codes; newsletter may need paid tier) |
| Domains ×3 | ~$5/mo | ~$5/mo |
| **Total** | **~$30–50/mo** | **~$50/mo baseline, ~$70–90 worst case** |

Transition overlap (~3–6 months, both stacks live): ~$80–95/mo. Start Supabase
on free tier for dev; upgrade at cutover. Monthly run-rate is roughly a wash —
the justification is security debt + capabilities, not hosting savings. The
dominant real cost is dev effort. All accounts client-owned.

## 7. Triggers — migrate only when one fires

1. **Client funds the EM/IS editor.** Do not build it on WP — the full
   five-reason argument is recorded in
   [`features/em-is-post-editor.md`](features/em-is-post-editor.md) §2.1. The
   editor is built natively against Postgres, which pulls the articles schema
   and auth with it.
2. **Contest outgrows the plugin** — next season's planning is the natural
   migration window (never mid-season).
3. **Operational failure** — WP/SiteGround produces a real outage, compromise,
   or maintenance burden spike.

Editor-trigger corollary: EM/IS articles become native Postgres rows, which
deletes two-thirds of the ingestor; only the DW import remains.

## 8. Do-now items (inside the current stack, no migration)

- [ ] **UMG homepage AEO fix without migration**: fetch articles at build time
      instead of client-side; add a scheduled rebuild (GH Actions cron).
      ~1 day, closes the crawler-invisibility hole in §5.
- [ ] **Minimal WP patches for the worst auth items**: longer auth codes,
      attempt counter, basic request throttle (I-6/I-9 lite) in
      `umg-photo-contest/includes/auth.php` — so account-takeover hardening
      isn't hostage to a migration that may be a year out.

## 9. Open questions

1. **Email**: does the client read mail on SiteGround mailboxes? Decides
   end-state SiteGround cost ($40/yr domains-only vs ~$200/yr kept plan) or a
   Google Workspace migration (~$7/user/mo).
2. DW source at migration time: still WP REST, or RSS/scrape fallback?
3. Newsletter volume (`umg-newsletter`): fits Resend free tier?
4. Client account creation (Stripe exists; Supabase/Vercel/Resend under client
   name, dev invited as collaborator).

## Migration order (when triggered)

1. Supabase project + `articles` schema + DW/EM/IS ingest; parallel-run the
   read path against the WP ingestor (low risk, easy A/B). Optionally under
   still-static frontends (cheapest variant: +$25/mo, no Vercel yet).
2. Frontends to Vercel + ISR; UMG sections server-rendered; retire deploy
   workflows.
3. Contest pipeline between seasons (auth → entries → payments → judging),
   applying the I-4…I-10 remediation designs.
4. EM/IS editor natively on Postgres (if that was the trigger, it may lead).
5. Decommission WP installs; final media migration off SiteGround; DNS/email
   endgame per §9 Q1.

---
*Plan based on codebase at commit `adb65a1` (2026-07-04). If plugins, deploy
workflows, or providers have changed since, re-verify before executing.*
