# apps/international-spectrum/lib/categories.ts

**Purpose:** Site config — International Spectrum's 6-category list plus the derived Header/Footer navigation groupings.

## Responsibilities
Defines the `Category` shape (`name`, `slug`, `color`) and the canonical list of International Spectrum's six categories: **Community Events** (`communitypublicprograms`, `#ea1479`), **Cultural and International Affairs** (`civicandculturalaffairs`, `#66c2ad`), **Arts, Science and Technology** (`arts`, `#655aa8`), **Diplomatic and Historic Events** (`historylegacy`, `#feb70c`), **Social Impact Events** (`socialimpactjustice`, `#ea1479`), **Video Interviews** (`video-interviews`, `#655aa8`). Derives responsive Header nav groupings — `mainCategories` (first 2, always visible), `lgOnlyCategories` (next 2, large screens only), `moreCategories` (last 2, in a "More" dropdown) — and Footer columns (alphabetically sorted, split at the midpoint into `leftCategories` / `rightCategories`).

## Key exports
- `Category` (interface) — `{ name, slug, color }`.
- `categories: Category[]` — the 6 categories, in homepage display order.
- `mainCategories` / `lgOnlyCategories` / `moreCategories` / `allCategories` — Header nav groupings (slices 0–2 / 2–4 / 4+ / all).
- `sortedCategories`, `leftCategories`, `rightCategories` — Footer nav columns (3 left, 3 right).

## Dependencies
- Internal: none
- External: none

## Used by
[app/layout.tsx](../app/layout.tsx.md) (Header/Footer props), [app/page.tsx](../app/page.tsx.md) (homepage sections), [app/articles/[slug]/page.tsx](../app/articles/[slug]/page.tsx.md) (category color map), [app/category/[slug]/page.tsx](../app/category/[slug]/page.tsx.md) (static params + names).

## Notes
- Slugs must match the WordPress category slugs on the backend — they drive API queries (`useArticles`) and `/category/<slug>/` static routes. Note `video-interviews` is the only hyphenated slug.
- **Names are display-only; slugs are the contract.** The 2026-09 renames (e.g. "Civic & Cultural Affairs" → "Cultural and International Affairs", "History & Legacy" → "Diplomatic and Historic Events") changed only `name` — every slug is unchanged, so no WP or routing changes were needed. The former "Leadership & Youth Engagement" category was deleted (its articles moved into Cultural and International Affairs in WordPress).
- The four accent colors cycle across categories (pink, teal, purple, yellow — yellow `#feb70c` is also the site's `--banner-border-color`).
- **Difference vs echo-media:** EM has only 3 categories, all one blue (`#0281b3`), so its Header puts everything in `mainCategories` and leaves the lg-only/More groups empty. The derivation logic is otherwise the same.

---
*Documented at commit 2354375.*
