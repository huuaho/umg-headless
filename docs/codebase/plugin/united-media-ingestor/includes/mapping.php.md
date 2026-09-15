# docs/plugin/united-media-ingestor/includes/mapping.php

**Purpose:** The category model — UM parent/child taxonomy spec, source-name→UM-slug mapping tables, and exclusion rules.

## Responsibilities
Defines, in code, the unified two-level category scheme the UMG site presents: 9 parent "display buckets" and 33 source-prefixed children (`dw-*` Diplomatic Watch, `em-*` Echo Media, `is-*` International Spectrum). Maps each source site's category display names onto those child slugs, lists source categories whose articles should be ingested but flagged excluded, and resolves a remote post's category names into `{mapped_slugs, unmapped, is_excluded}`.

## Key exports
- `um_normalize_name($s) -> string` — tag-strip + entity-decode + whitespace-collapse for reliable name comparison.
- `um_category_parents() -> array` — slug→name for the 9 parents: `world-news-politics`, `profiles-opinions`, `economy-business`, `diplomacy`, `art-culture`, `education-youth`, `local-community`, `wellbeing-env-tech`, `video-interviews` (added in 0.10.0 as its own bucket so the UMG homepage can render a dedicated Video Interviews section; sole child `is-video-interviews`).
- `um_category_children_spec() -> array` — child slug → `{parent, name}` for every child term.
- `um_source_category_map() -> array` — per site id, source category *display name* → UM child slug (names must match the remote REST `name` after normalization). The `internationalspectrum` keys track the source site's 0.11.0 category renames: 'Diplomatic and Historic Events'→`is-history-legacy`, 'Arts, Science and Technology'→`is-arts`, 'Cultural and International Affairs'→`is-civic-cultural`, 'Social Impact Events'→`is-social-impact`, 'Community Events'→`is-community-programs`, 'Video Interviews'→`is-video-interviews`.
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
- Adding a category is a code change here (child spec + source map entry) plus a `UMI_VERSION` bump — the `admin_init` upgrade hook in [../united-media-ingestor.php](../united-media-ingestor.php.md) re-seeds missing terms on deploy. `um_resolve_categories` only returns slugs; `wp_set_object_terms` in storage relies on the term existing.
- Seeding only *creates* terms, never renames them: when a child's display name changes (the IS renames in 0.11.0 touched five children's names, e.g. `is-history-legacy` is now "International Spectrum: Diplomatic and Historic Events"), the existing UMG-side terms must be renamed manually in wp-admin.
- `is-leadership-youth` was removed in 0.11.0 (its articles moved to Cultural and International Affairs on the source site), leaving `education-youth` with only the Echo Media child; after a mapping change like this, use the admin re-sync tool ([admin-endpoints.php](admin-endpoints.php.md)) to re-map existing posts.
- Exclusion is coarse: one excluded category marks the *whole article* excluded (`um_is_excluded = 1`), even if it also has mapped categories — it still gets its mapped terms assigned but is filtered from default REST results.

---
*Documented at commit 2354375.*
