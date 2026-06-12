# apps/international-spectrum/lib/categories.ts

**Purpose:** Site config — International Spectrum's 7-category list plus the derived Header/Footer navigation groupings.

## Responsibilities
Defines the `Category` shape (`name`, `slug`, `color`) and the canonical list of International Spectrum's seven categories: **Community & Public Programs** (`communitypublicprograms`, `#ea1479`), **Civic & Cultural Affairs** (`civicandculturalaffairs`, `#66c2ad`), **Arts** (`arts`, `#655aa8`), **History & Legacy** (`historylegacy`, `#feb70c`), **Social Impact & Justice** (`socialimpactjustice`, `#ea1479`), **Leadership & Youth Engagement** (`leadershipyouthengagement`, `#66c2ad`), **Video Interviews** (`video-interviews`, `#655aa8`). Derives responsive Header nav groupings — `mainCategories` (first 2, always visible), `lgOnlyCategories` (next 2, large screens only), `moreCategories` (last 3, in a "More" dropdown) — and Footer columns (alphabetically sorted, split into `leftCategories` / `rightCategories`).

## Key exports
- `Category` (interface) — `{ name, slug, color }`.
- `categories: Category[]` — the 7 categories, in homepage display order.
- `mainCategories` / `lgOnlyCategories` / `moreCategories` / `allCategories` — Header nav groupings (slices 0–2 / 2–4 / 4+ / all).
- `sortedCategories`, `leftCategories`, `rightCategories` — Footer nav columns (4 left, 3 right).

## Dependencies
- Internal: none
- External: none

## Used by
[app/layout.tsx](../app/layout.tsx.md) (Header/Footer props), [app/page.tsx](../app/page.tsx.md) (homepage sections), [app/articles/[slug]/page.tsx](../app/articles/[slug]/page.tsx.md) (category color map), [app/category/[slug]/page.tsx](../app/category/[slug]/page.tsx.md) (static params + names).

## Notes
- Slugs must match the WordPress category slugs on the backend — they drive API queries (`useArticles`) and `/category/<slug>/` static routes. Note `video-interviews` is the only hyphenated slug.
- The four accent colors cycle across categories (pink, teal, purple, yellow — yellow `#feb70c` is also the site's `--banner-border-color`).
- **Difference vs echo-media:** EM has only 3 categories, all one blue (`#0281b3`), so its Header puts everything in `mainCategories` and leaves the lg-only/More groups empty. The derivation logic is otherwise the same.

---
*Documented at commit 1cbdce5.*
