# docs/plugin/united-media-ingestor/assets/search-results.css

**Purpose:** Stylesheet for the plugin's WordPress search-results page — thumbnail-left/content-right card layout.

## Responsibilities
Styles every class emitted by [../templates/search-results.php](../templates/search-results.php.md): the 800px-max container, search header + inline search form (input + dark icon button with focus ring), the results list (100×75 rounded thumbnail or gray placeholder, bold title with blue hover, uppercase byline, muted date, clamped excerpt), the centered no-results block, and pagination controls. Responsive: stacked form and column cards under 640px, padding tweak for tablets.

## Key exports
CSS classes (prefix `um-`): `.um-search-container`, `.um-search-header`, `.um-search-title`, `.um-search-form/input/button`, `.um-search-results-list`, `.um-search-result-item`, `.um-result-link/thumbnail/thumbnail-placeholder/content/title/meta/source/date/excerpt`, `.um-no-results`, `.um-search-pagination` (+ `.current`, `.dots`).

## Dependencies
- Internal: enqueued as handle `um-search-results` by `um_enqueue_search_assets()` in [../includes/search.php](../includes/search.php.md) (URL built from `UMI_URL`, version 1.0.0), markup from [../templates/search-results.php](../templates/search-results.php.md).
- External: none (vanilla CSS, gray/blue Tailwind-like palette hardcoded).

## Used by
Only loaded on `is_search()` pages of the API backend — legacy/debug-only in production given the bootstrap's front-end redirect (see [../united-media-ingestor.php](../united-media-ingestor.php.md)).

## Notes
- The `.um-search-pagination` rules are currently dead style — the template renders all results without pagination.

---
*Documented at commit 1cbdce5.*
