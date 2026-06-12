# docs/plugin/united-media-ingestor/templates/search-results.php

**Purpose:** Theme-override template that renders WordPress search results as a list of ingested-article cards linking to the original source sites.

## Responsibilities
Loaded by the `template_include` filter in [../includes/search.php](../includes/search.php.md) for non-empty searches. Strips Divi search-form parameters by redirecting to a clean `/?s=` URL, fetches **all** matching articles via `um_get_search_results($query, 1, -1)` (no pagination), and renders the theme header/footer around a results list: thumbnail (or SVG placeholder), title, "BY AUTHOR" line, formatted date, 30-word excerpt — each card an external link (`target="_blank" rel="noopener noreferrer"`) to the article's source URL. Includes its own search form and a no-results message.

## Key exports
None (template file; executes at render time). Notable behavior: `wp_redirect` + `exit` when `et_pb_searchform_submit` / `et_pb_include_posts` / `et_pb_include_pages` query args are present.

## Dependencies
- Internal: [../includes/search.php](../includes/search.php.md) (`um_get_search_results`, `um_get_search_result_data`), styled by [../assets/search-results.css](../assets/search-results.css.md) (enqueued there).
- External: WordPress template tags (`get_header`, `get_footer`, `get_search_query`, the loop), the active theme's header/footer (Divi).

## Used by
WordPress front-end search rendering on the API backend only. In production this is mostly unreachable: the bootstrap ([../united-media-ingestor.php](../united-media-ingestor.php.md)) 301-redirects all non-`/wp-json` traffic to www.unitedmediadc.com, so the template is legacy/debug-only.

## Notes
- `per_page = -1` renders every match in one page — fine for moderate result sets, heavy for broad terms; the CSS ships pagination styles (`.um-search-pagination`) that this template never emits.
- All output is escaped (`esc_html`/`esc_url`/`esc_attr`).

---
*Documented at commit 1cbdce5.*
