# Conversion Scaffold — `united-media-ingestor`

> The aggregation pipeline: pulls EM/IS/DW WP REST into a private `um_article`
> CPT on the UMG install and serves the unified `GET um/v1/articles` endpoint
> UMG's frontend consumes. Conversion ≈ **1 week**; this is **phase 1** of the
> whole migration because it's read-only and parallel-runnable.

## Target schema

`articles` table, one row per article, `brand` column
(`echo-media` | `international-spectrum` | `diplomatic-watch`), plus:
`remote_post_id`, `source_url`, `slug`, `title`, `excerpt`, `plaintext`,
`published_at`, `author_name`, `category` (or a `categories` join),
`featured_image_url`, `image_urls jsonb`, `is_excluded`, `word_count`.
Unique on `(brand, remote_post_id)` — the existing dedup key. Generated
`tsvector` column + GIN index for search. `ingest_cursors (brand, since)`
replaces the per-site `um_get_since` options.

Images stay **hotlinked** (current behavior) until the editor/native-articles
phase decides otherwise.

## File-by-file conversion map

| Plugin file | Fate | Target |
| --- | --- | --- |
| `config.php` (`um_sites_config`) | Convert | `ingest_sources` config (env or table): base URLs, cursors, toggles |
| `cron.php` (5-min incremental, 15-min backfill, 1-min server backfill) | Convert | `pg_cron` schedule invoking the ingest edge function; backfill = same function with a `mode` arg |
| `incremental.php` | Convert | **edge function `ingest`**: fetch `wp/v2/posts?after=<cursor>` per source, upsert, advance cursor. Direct port |
| `backfill.php` | Convert | same function, paging backwards; log progress to an `ingest_runs` table |
| `http.php`, `helpers.php`, `normalize.php` | Convert | utility module inside the edge function (fetch + normalize WP post JSON, resolve `_embedded` media, inline `<img>` extraction) |
| `mapping.php` (source-category map, children spec, exclusions) | Convert | `category_mappings` table — **read carefully, the code is the spec** (EM category overhaul doc depends on it too) |
| `storage.php` (CPT upsert, dedup) | **DELETE** | plain `INSERT ... ON CONFLICT` |
| `rest-api.php` (`GET um/v1/articles`) | **DELETE** | PostgREST: `articles?brand=eq.X&order=published_at.desc` + FTS via `tsvector`; pagination native |
| `search.php` + `templates/` + `assets/` (WP-side search page) | **DELETE** | legacy WP-facing UI, unused by the headless frontend — confirm, then drop |
| `admin-endpoints.php` | **DELETE** | manual triggers become dashboard/SQL or a protected function invocation |

## Frontend seam

`packages/api/client.ts` custom mode (`getArticles`, `searchArticles`) — add a
third `API_MODE` (e.g. `supabase`) hitting PostgREST behind the same
signatures. `useArticles`, `toSectionData` etc. unchanged. **The `API_MODE`
switch is the built-in A/B mechanism**: deploy UMG pointing at either backend
and diff the rendered sections.

## End-state note

Once the EM/IS editor exists (architecture doc §7 trigger 1), EM/IS rows
become native writes and their ingest loops are deleted — only the **DW**
source remains scheduled. Design the ingest function so removing a source is
config, not code.

## Cutover checklist

- [ ] Backfill full archive from WP MySQL tap or REST paging ([data-migration.md](data-migration.md))
- [ ] Parallel-run: cron ingest into Postgres while WP ingestor still runs; diff row counts + latest-N per brand
- [ ] A/B UMG frontend via `API_MODE`; verify search parity (FTS vs `WP_Query 's'`) and category filters against `category_mappings`
- [ ] Flip UMG deploy env; leave WP ingestor running (idle consumer) for a settling period, then disable its crons

---
*Plan based on codebase at commit `adb65a1` (2026-07-04). If plugins, deploy
workflows, or providers have changed since, re-verify before executing.*
