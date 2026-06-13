# docs/plugin/united-media-ingestor/includes/mapping.php

**Purpose:** The category model — UM parent/child taxonomy spec, source-name→UM-slug mapping tables, and exclusion rules.

## Responsibilities
Defines, in code, the unified two-level category scheme the UMG site presents: 8 parent "display buckets" and ~33 source-prefixed children (`dw-*` Diplomatic Watch, `em-*` Echo Media, `is-*` International Spectrum). Maps each source site's category display names onto those child slugs, lists source categories whose articles should be ingested but flagged excluded, and resolves a remote post's category names into `{mapped_slugs, unmapped, is_excluded}`.

## Key exports
- `um_normalize_name($s) -> string` — tag-strip + entity-decode + whitespace-collapse for reliable name comparison.
- `um_category_parents() -> array` — slug→name for the 8 parents: `world-news-politics`, `profiles-opinions`, `economy-business`, `diplomacy`, `art-culture`, `education-youth`, `local-community`, `wellbeing-env-tech`.
- `um_category_children_spec() -> array` — child slug → `{parent, name}` for every child term.
- `um_source_category_map() -> array` — per site id, source category *display name* → UM child slug (names must match the remote REST `name` after normalization).
- `um_excluded_source_categories() -> array` — per site: diplomaticwatch "Photo Gallery"/"Look Your Best With Jane Pennewell", echo-media "Media Network", internationalspectrum "Uncategorized".
- `um_resolve_categories($site_id, $source_category_names) -> {is_excluded, excluded_reason, mapped_slugs, unmapped}` — exclusion check first (any excluded category flags the post), then mapping; unmatched names are returned for tracking.

## Dependencies
- Internal: none (data + pure resolution logic).
- External: WordPress string helpers only.

## Used by
- [storage.php](storage.php.md) — `um_upsert_article` resolves categories, assigns `um_category` terms, records unmapped names via `um_track_unmapped_categories`.
- [../united-media-ingestor.php](../united-media-ingestor.php.md) — activation seeds `um_category` terms from `um_category_parents()` + `um_category_children_spec()`.
- The slugs are the values of the public `category` filter on `GET /wp-json/um/v1/articles` ([rest-api.php](rest-api.php.md)) used by the UMG frontend ([packages/api/client.ts](../../../packages/api/client.ts.md)).

## Notes
- Adding a category is a three-step code change: child spec here, source map entry here, then re-activate the plugin (or create the term manually) so the term exists — `um_resolve_categories` only returns slugs; `wp_set_object_terms` in storage relies on the term existing.
- Exclusion is coarse: one excluded category marks the *whole article* excluded (`um_is_excluded = 1`), even if it also has mapped categories — it still gets its mapped terms assigned but is filtered from default REST results.

---
*Documented at commit 1cbdce5.*
