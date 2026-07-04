# Conversion Scaffold — `umg-photo-contest`

> The contest pipeline: auth, drafts, photos, proofs, payment, judging, school
> batches. 27 REST routes under `umg/v1/*`. Largest conversion (~2–3 weeks),
> done **between seasons**. Security upgrades applied during conversion are
> specced in [`../../remediation/payment-deferred-custom-backend.md`](../../remediation/payment-deferred-custom-backend.md)
> — this doc maps *what moves where*; that doc says *how the risky parts are
> hardened*.

## Target schema

`entries`, `entry_photos` (≤3/entry, title + description), `entry_documents`
(student proofs, private bucket, UUID keys), `entry_consents` (immutable,
versioned statements — I-4), `transactions` (Stripe), `scores`
(per-judge × per-criterion, unique on `(entry_id, judge_id)`), plus shared
`users` + `memberships`. School batches: `school_batches` +
`entries.batch_id nullable` + `entries.seq_in_batch` (replaces the
`umgpc_school_batch` meta flag + named-lock sequence numbering — use a
per-batch counter with `SELECT ... FOR UPDATE`, simpler than MySQL named
locks).

## File-by-file conversion map

| Plugin file | Fate | Target |
| --- | --- | --- |
| `jwt.php` | **DELETE** | Supabase Auth sessions |
| `auth.php` (request-code / verify-code / me) | **DELETE** | Supabase email OTP + `GET /auth/user`; retires I-6/I-9 |
| `roles.php` (Contest Judge role) | **DELETE** | `memberships.role = 'judge'` + RLS policies |
| `cors.php` | **DELETE** | platform |
| `config.php` | Convert | env vars / `config` table; competition rules stay in `lib/competitions/current.ts`, shared with the submit validator (I-4) |
| `post-types.php` (CPT + delete cascades) | Convert | schema above; cascades become FK `ON DELETE` |
| `draft.php` (GET/PUT draft, photo upload/delete, proof upload/delete, retitle) | Convert | PostgREST CRUD + RLS (owner-only) for fields; storage SDK uploads to buckets; proof → private bucket + signed-URL fetch endpoint (I-7) |
| `submission.php` (`POST /submit`) | Convert | **edge function** `submit-entry`: transactional, re-validates from persisted state, writes `entry_consents` (I-4) |
| `payment.php` (payment-status, stripe-webhook) | Convert | status → PostgREST read; webhook → **edge function** `stripe-webhook` (signature verify, replay protection — port existing logic incl. the I-2/I-5/I-11 fixes already shipped) |
| `school.php` (10 routes: applications CRUD, photos, submit, retitle, checkout) | Convert | CRUD → PostgREST + RLS (batch-owner scope); checkout → **edge function** `school-checkout` (Stripe Checkout Session, port of existing); sequence numbering per schema note above |
| `judging.php` (admin/submissions list/detail/score/results) | Convert | list/detail → PostgREST views (**blind-judging view strips PII** via RLS, replacing the `umgpc_blind_judging` option with a `settings` row); score upsert → PostgREST upsert or small RPC; results → SQL aggregate view (admin-only RLS) |
| `cleanup.php` (orphaned-draft cron) | Convert | `pg_cron` delete + storage-orphan sweep |
| `admin-tools.php` | Review at cutover | likely replaced by Supabase dashboard / SQL |

## Endpoint map (frontend seam)

All 27 `umg/v1/*` routes disappear. Frontend callers and their replacements:

| Caller | Today | After |
| --- | --- | --- |
| `apps/umg/lib/auth/api.ts` + `AuthContext.tsx` | request-code/verify-code/me, token in localStorage | supabase-js auth; keep the `useAuth` interface so consumers don't change. Judge/admin token handling per I-10 (in-memory access + httpOnly refresh) |
| `SubmissionForm.tsx` (draft save, photo/proof upload) | multipart to `draft/*` | PostgREST row updates + storage SDK upload; same form logic |
| Payment status polling | `payment-status` | PostgREST read on `transactions`/`entries` |
| Judge panel `apps/umg/app/admin/*` + `lib/judging/*` | `admin/*` routes | PostgREST views + score upsert; capability checks become RLS (frontend just handles 401/403) |
| School registration UI | `school/*` routes | PostgREST CRUD + `school-checkout` function |

## Deleted outright (no replacement written)

`jwt.php`, `auth.php`, `roles.php`, `cors.php` — ~40% of the plugin. The
Stripe webhook and submit validation are the only two pieces of real ported
logic; everything else is CRUD reconfigured as schema + policies.

## Cutover checklist

- [ ] Dual-register the Stripe webhook (WP + edge function) for the switch window
- [ ] ETL per [data-migration.md](data-migration.md): users, entries (+ school batches), photos/proofs to buckets, payment statuses
- [ ] Re-verify the three-account matrix (judge / subscriber / WP-admin equivalents) against RLS
- [ ] Frontend seam swapped behind a flag; A/B on staging
- [ ] Off-season only; plugin left installed-but-idle one season post-cutover

---
*Plan based on codebase at commit `27a1dfc` (2026-07-04). If plugins, deploy
workflows, or providers have changed since, re-verify before executing.*
