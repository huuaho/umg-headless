# apps/echo-media/lib/categories.ts

**Purpose:** Site config — Echo Media's category list plus the derived Header/Footer navigation groupings.

## Responsibilities
Defines the `Category` shape (`name`, `slug`, `color`) and the canonical list of Echo Media's three categories: **Art & Culture** (`artculture`), **Education** (`education`), **Environment** (`environment`) — all sharing the brand blue `#0281b3`. Derives navigation groupings consumed by the shared Header (with only 3 categories, everything goes in `mainCategories`; `lgOnlyCategories` and `moreCategories` are empty) and Footer (alphabetically sorted, split into `leftCategories` / `rightCategories` columns).

## Key exports
- `Category` (interface) — `{ name, slug, color }`.
- `categories: Category[]` — the 3 categories, in homepage display order.
- `mainCategories` / `lgOnlyCategories` / `moreCategories` / `allCategories` — Header nav groupings (here: all / empty / empty / all).
- `sortedCategories`, `leftCategories`, `rightCategories` — Footer nav columns.

## Dependencies
- Internal: none
- External: none

## Used by
[app/layout.tsx](../app/layout.tsx.md) (Header/Footer props), [app/page.tsx](../app/page.tsx.md) (homepage sections), [app/articles/[slug]/page.tsx](../app/articles/[slug]/page.tsx.md) (category color map), [app/category/[slug]/page.tsx](../app/category/[slug]/page.tsx.md) (static params + names).

## Notes
- Slugs must match the WordPress category slugs on the backend — they drive API queries (`useArticles`) and `/category/<slug>/` static routes.
- The `color` feeds category labels in sections and on article pages; Echo Media deliberately uses one uniform color.
- **Difference vs international-spectrum:** IS has 7 categories with four distinct colors (`#ea1479`, `#66c2ad`, `#655aa8`, `#feb70c`) and actually splits the Header nav: `mainCategories` = first 2, `lgOnlyCategories` = next 2, `moreCategories` = rest. The derivation logic is otherwise the same.

---
*Documented at commit 1cbdce5.*
