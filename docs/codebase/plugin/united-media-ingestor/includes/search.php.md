# docs/plugin/united-media-ingestor/includes/search.php

**Purpose:** Intercepts WordPress native search (`/?s=…`) on the backend to show only ingested articles with full-text search across title, excerpt, and plaintext content.

## Responsibilities
Overrides the active theme's (Divi's) search template with the plugin's own, builds the search `WP_Query` with custom SQL filters that LEFT JOIN the `um_plaintext` meta so matches go beyond the stored excerpt, formats result rows for display, and enqueues the result stylesheet.

## Key exports
- `um_search_template_override($template)` — `template_include` filter at `PHP_INT_MAX`; for non-empty searches returns [../templates/search-results.php](../templates/search-results.php.md).
- `um_get_search_results($search_term, $page = 1, $per_page = 20) -> WP_Query` — queries published `um_article` posts (excluded items filtered out), ordered by `um_date_gmt` desc; temporarily installs the three SQL filters below, passing the term via the `$um_current_search_term` global.
- `um_search_where_custom` / `um_search_join_custom` / `um_search_groupby_custom` — `posts_where`/`posts_join`/`posts_groupby` filters: `LIKE` match on `post_title`, `post_content` (excerpt), and joined `um_plaintext` meta, grouped by post ID to dedupe the LEFT JOIN.
- `um_get_search_result_data($post) -> array` — `{id, title, excerpt, url (source URL), thumbnail, author, source (label from um_sites_config), date (formatted)}` for the template.
- `um_enqueue_search_assets()` — on `wp_enqueue_scripts`, enqueues [../assets/search-results.css](../assets/search-results.css.md) on search pages.

## Dependencies
- Internal: [storage.php](storage.php.md) (CPT + meta), [config.php](config.php.md) (`um_sites_config()` for labels, `UMI_URL` for the asset path defined in [../united-media-ingestor.php](../united-media-ingestor.php.md)), [../templates/search-results.php](../templates/search-results.php.md), [../assets/search-results.css](../assets/search-results.css.md).
- External: WordPress template/query/enqueue APIs, `$wpdb` (prepared LIKE clauses).

## Used by
WordPress front-end search requests to the API backend — but see Notes: the bootstrap's `template_redirect` 301 sends all non-`/wp-json` traffic to the frontend, so this path is effectively legacy/dormant in production.

## Notes
- Largely superseded by `GET /um/v1/articles?search=` ([rest-api.php](rest-api.php.md)) for the headless frontend; ironically this legacy path searches `um_plaintext` while the REST route does not.
- Search uses raw `LIKE '%term%'` — no relevance ranking; ordering is by date.
- The where/join/groupby filters apply to *any* query that runs while installed (they don't check the query object), but the install/remove window is confined to the single `WP_Query` in `um_get_search_results`.
- Result links go to the original source article (`um_source_url`), never to local pages.

---
*Documented at commit 1cbdce5.*
