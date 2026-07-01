# Echo Media Category Overhaul

Replace Echo Media's current 3 categories with a new, EM-approved set — a mechanical multi-file change blocked only on the final category list + colors being decided.

## Current State (verified against code)

| Name | Slug | Color |
|------|------|-------|
| Art & Culture | `artculture` | #0281b3 |
| Education | `education` | #0281b3 |
| Environment | `environment` | #0281b3 |

- All 3 share one color, defined in `apps/echo-media/lib/categories.ts`.
- All 3 render as homepage sections via `SECTION_TYPE_MAP` in `apps/echo-media/app/page.tsx` (type1/type2/type3).
- Nav currently puts all 3 in `mainCategories`; `lgOnlyCategories` and `moreCategories` are empty.

## Blocking Decision (required before starting)

1. **Final category list** — names + slugs. Slugs must be chosen up front because they must match WordPress exactly (see Step 1/2).
2. **Colors** — one hex per category. Today all three are `#0281b3`; the array supports per-category colors, so distinct colors are fine.
3. **Article reassignment plan** — how existing EM posts map onto the new categories (WP editorial task).

## Implementation Checklist

### 1. WordPress backend (source of truth — do first)
- [ ] Create the new categories in EM's WordPress admin. **Record the exact slugs** WP assigns — these are what the frontend looks up.
- [ ] Reassign existing articles to the new categories.
- [ ] Delete or merge the old categories once articles are moved.

### 2. `apps/echo-media/lib/categories.ts`
- [ ] Replace the `categories` array entries with the new `{ name, slug, color }` objects.
- [ ] **Slugs must match the WP category slugs exactly.** `getCategoryId()` in `packages/api/wp-client.ts:36` resolves them at runtime via `GET /wp/v2/categories?slug={slug}`; a mismatch silently returns `null` and the section/page shows no articles.
- [ ] If the new list has **more than 4 categories**, adjust the nav split (`mainCategories` / `lgOnlyCategories` / `moreCategories`) so the header doesn't overflow. Today all go into `mainCategories`; move overflow into `lgOnlyCategories` (shown only on large screens) and/or `moreCategories` (a "More" dropdown). Footer split (`sortedCategories` → `leftCategories`/`rightCategories`) is automatic and needs no change.

### 3. Homepage — `apps/echo-media/app/page.tsx`
- [ ] Update `SECTION_TYPE_MAP` so every new slug maps to a `SectionType` (`type1`–`type4`). Any slug missing from the map falls back to `"type1"`, so at minimum the build won't break — but set them intentionally for visual variety.
- [ ] The section wrappers themselves need **no manual add/remove**: `page.tsx` maps over `categories` and renders one `CategorySectionWrapper` per entry automatically. Section count follows the array length.

### 4. Downstream — UMG ingestor (only if EM feeds UMG's aggregated site)
- [ ] Update `um_source_category_map()` in `docs/plugin/united-media-ingestor/includes/mapping.php` to map the new EM WP category names to normalized UM slugs.
- [ ] Deploy the mapping, then flush + re-ingest EM articles in UMG's WP DB so old category terms are replaced.
- [ ] EM's own frontend needs **no flush** — category IDs are looked up via REST at runtime (see Step 2).

## What Needs NO Change (and why)

- **Category pages** (`apps/echo-media/app/category/[slug]/page.tsx`) — `generateStaticParams()` and `generateMetadata()` both read from `categories.ts` dynamically, so new slugs generate pages automatically.
- **Header & Footer** (shared `@umg/ui`) — the layout passes the `categories`/nav-split exports into the shared components; updating `categories.ts` propagates automatically.
- **Article pages** (`apps/echo-media/app/articles/[slug]/page.tsx`) — `categoryColorMap` is built inline from `categories.map((c) => [c.name, c.color])` and passed to `ArticleLayout`. It auto-updates from the array; no code change unless the map's construction logic itself changes.

## Testing Checklist

- [ ] `npm run build` (or the EM app's build) succeeds — no missing-slug type errors.
- [ ] Homepage renders one section per new category, each with articles (confirms slugs resolve to WP IDs).
- [ ] Each `/category/{slug}` page loads and lists that category's articles.
- [ ] Header nav shows the expected categories; if >4, verify the large-screen and "More" overflow behavior.
- [ ] Footer lists all categories, split left/right.
- [ ] Open an article in a new category — verify the category label and its color render correctly.
- [ ] (If ingestor updated) confirm re-ingested EM articles appear under the correct new categories on UMG.

## Effort

Small — roughly half a day of frontend work once the category list is finalized. Two files carry the real change (`categories.ts`, `page.tsx`); everything else is data-driven. Nav-split logic adds a little effort only if the new set exceeds 4 categories. The larger real cost is the WordPress-side work (creating categories, reassigning articles) and, if applicable, the ingestor mapping update + re-ingest, which are editorial/ops tasks rather than code.
