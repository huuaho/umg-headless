# apps/echo-media/app/page.tsx

**Purpose:** Homepage — renders one article section per category using the shared `CategorySectionWrapper`.

## Responsibilities
Maps over the app's three categories and renders a `CategorySectionWrapper` for each, choosing a layout via a local `SECTION_TYPE_MAP` (slug → section type). Everything is wrapped in `SeenArticlesProvider` so sections deduplicate articles across each other (the `priority={index}` prop gives earlier sections first claim).

## Key exports
- `Home() -> JSX` — default export; the `/` route.

## Dependencies
- Internal: [lib/categories.ts](../lib/categories.ts.md) (`categories`), [@umg/ui CategorySectionWrapper](../../../packages/ui/sections/CategorySectionWrapper.tsx.md), [@umg/ui SeenArticlesContext](../../../packages/ui/SeenArticlesContext.tsx.md) (`SeenArticlesProvider`, `SectionType` type)
- External: `react`

## Used by
Next.js App Router — the `/` route.

## Notes
- `SECTION_TYPE_MAP`: `artculture → type1`, `education → type2`, `environment → type3`; unmapped slugs fall back to `type1`.
- Data fetching, loading skeletons, and error/retry states are all handled inside `CategorySectionWrapper` (client-side via `@umg/api` hooks), not here.
- **Difference vs international-spectrum:** IS maps 7 categories and also uses `type4` and `type4-text` section layouts; EM only uses types 1–3. The component structure is otherwise identical.

---
*Documented at commit 1cbdce5.*
