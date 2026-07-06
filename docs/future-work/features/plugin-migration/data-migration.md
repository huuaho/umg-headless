# Data Migration — WP MySQL → Postgres, uploads → buckets

> The ETL companion to the per-plugin scaffolds. Runs **per phase**, not as
> one big-bang export. ≈ 3–5 days total including dry runs. Phase numbers
> follow the architecture doc's "Migration order" (1 articles, 2 frontends,
> 3 contest, 4 editor, 5 decommission); phases 2 and 4 move no WP data, so
> only 1 and 3 appear below.

## Access path

SiteGround MySQL **is** remotely accessible: Site Tools → Site → MySQL →
Remote, allowlist the ETL machine's IP, connect on port 3306 (correction
recorded in [`../../custom-backend-architecture.md`](../../custom-backend-architecture.md) §3).
Prefer direct SQL reads over REST paging — faster, and captures fields the
REST API hides (private CPTs like `um_article` and `umg_submission` have
`show_in_rest => false`).

Files: pull `wp-content/uploads/` via SFTP (same credentials as the deploy
workflows use today).

## Phase 1 — articles (with the ingestor conversion)

- Source: `wp_posts` (`post_type = 'um_article'`) + `wp_postmeta`
  (`um_*` keys) + `um_category` term relationships on the UMG install.
- Transform: meta rows → `articles` columns
  (`um_source_site`→`brand`, `um_remote_post_id`→`remote_post_id`,
  `um_featured_image_url`, `um_image_urls` (JSON), `um_plaintext`,
  `um_date_gmt`→`published_at`, `um_is_excluded`, `um_author_name`).
- Images: hotlinked today, stay hotlinked — **no file copies in this phase**.
- Alternative seed: skip ETL entirely and let the new ingest function backfill
  from the EM/IS/DW REST APIs (it re-derives everything). ETL is only faster
  for the full archive; pick one, don't mix.
- Verify: row count per brand matches WP; newest-10 per brand identical.

## Phase 3 — contest (between seasons, with the photo-contest conversion)

- Source: `wp_posts` (`post_type = 'umg_submission'`) + `wp_postmeta`
  (`umgpc_*`) + `wp_users`/`wp_usermeta` (accounts, payment status) on the
  UMG install.
- Transform:
  - users → `users` (email, created; drop WP password hashes — auth becomes
    OTP; do **not** migrate `umgpc_auth_code*` remnants),
  - submissions → `entries` (+ `school_batches` for `umgpc_school_batch`
    rows, preserving `seq` numbering),
  - photo slots `umgpc_photo_{1..3}_*` → `entry_photos`,
  - consents → `entry_consents` (mark rows `migrated_from_wp = true`; they
    predate statement versioning),
  - payment meta + Stripe IDs → `transactions`,
  - `umgpc_score_*` → `scores` keyed by judge.
- Files (the only file-copy step):
  - contest photos (Media Library attachments referenced by photo-slot IDs) →
    `public-media` bucket,
  - student proofs (`umgpc_student_proof_id`) → **`private-documents`**
    bucket, UUID keys, never public (audit I-7),
  - rewrite `entry_photos.storage_key` / `entry_documents.storage_key`;
    verify every DB reference resolves to a copied object (no orphans either
    direction).
- Verify: entry counts by status/division match; every `submitted` entry has
  its photos + proof retrievable via signed URL; payment statuses reconcile
  against Stripe dashboard exports.

## Not migrated

- EM/IS native `wp_posts` — stay in WP until the editor phase makes articles
  native; the ingestor keeps mirroring them meanwhile.
- Newsletter list — lives in Mailchimp, never touches WP or Postgres.
- WP users outside the contest (wp-admin accounts) — die with the installs.

## Rules

- Every script idempotent (`ON CONFLICT` upserts) — reruns must be safe.
- Dry-run into a scratch schema first; diff counts before touching prod.
- Final snapshot: full MySQL dump + uploads archive stored client-side before
  any WP install is decommissioned (architecture doc §3 warning).

---
*Plan based on codebase at commit `adb65a1` (2026-07-04). If plugins, deploy
workflows, or providers have changed since, re-verify before executing.*
