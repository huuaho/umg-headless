# Conversion Scaffold — `em-headless-config.php` / `is-headless-config.php`

> Single-file plugins on the EM and IS WP installs: CORS allowlist, rebuild
> webhook, `video_url` post meta, author-name REST field. Conversion ≈
> **half a day** — almost pure deletion. Rides along with whichever phase
> moves EM/IS content (ingestor phase for reads; editor phase for writes).

## Conversion map (both files are near-identical)

| Concern | Today | Fate |
| --- | --- | --- |
| CORS allowlist for site origins | `add_action('init', ...)` header emission | **DELETE** — platform-managed CORS on the new API |
| Rebuild webhook | `transition_post_status` → `POST github.com/.../dispatches` (`GH_REBUILD_TOKEN`, `deploy-echo-media` / `deploy-international-spectrum`) | Replace with **one revalidate/dispatch call on publish** in the new backend (on-demand ISR revalidation once frontends are on Vercel; `repository_dispatch` retained only while frontends remain static) |
| `video_url` post meta (`register_post_meta`, meta box) | WP meta, `show_in_rest` | `articles.video_url` column; editor exposes a field. Frontend (`packages/api/wp-client.ts`, `ArticleLayout`) already renders it — only the fetch source changes |
| Author name REST field | REST response filter | `articles.author_name` column (ingestor already captures it) |

## Notes

- These plugins have **no data of their own** — nothing to ETL.
- They are the last thing keeping the EM/IS WP installs "special"; once the
  editor phase makes EM/IS articles native, these files and the installs
  themselves retire together.
- Until then, if the ingestor phase ships first, these plugins keep running
  unchanged on WP — the WP-side rebuild webhook keeps rebuilding the EM/IS
  static frontends while UMG reads from Postgres. No interim edit needed.

## Cutover checklist

- [ ] Confirm new-backend publish path fires revalidation for EM/IS article + category pages
- [ ] Port CORS origin list (incl. Vercel preview URLs) to platform config
- [ ] Verify `video_url` renders on an EM interview article post-swap
- [ ] Deactivate plugin only when the corresponding WP install is decommissioned

---
*Plan based on codebase at commit `27a1dfc` (2026-07-04). If plugins, deploy
workflows, or providers have changed since, re-verify before executing.*
