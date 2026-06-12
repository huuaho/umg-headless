# apps/international-spectrum/app/page.tsx

**Purpose:** Homepage — renders one article section per category using the shared `CategorySectionWrapper`.

## Responsibilities
Maps over the app's seven categories and renders a `CategorySectionWrapper` for each, choosing a layout via a local `SECTION_TYPE_MAP` (slug → section type). Everything is wrapped in `SeenArticlesProvider` so sections deduplicate articles across each other (the `priority={index}` prop gives earlier sections first claim).

## Key exports
- `Home() -> JSX` — default export; the `/` route.

## Dependencies
- Internal: [lib/categories.ts](../lib/categories.ts.md) (`categories`, via `@/lib`), [@umg/ui CategorySectionWrapper](../../../packages/ui/sections/CategorySectionWrapper.tsx.md), [@umg/ui SeenArticlesContext](../../../packages/ui/SeenArticlesContext.tsx.md) (`SeenArticlesProvider`, `SectionType` type)
- External: `react`

## Used by
Next.js App Router — the `/` route.

## Notes
- `SECTION_TYPE_MAP`: `communitypublicprograms → type1`, `civicandculturalaffairs → type2`, `arts → type3`, `historylegacy → type4`, `socialimpactjustice → type1`, `leadershipyouthengagement → type4-text`, `video-interviews → type4`; unmapped slugs fall back to `type1`.
- Data fetching, loading skeletons, and error/retry states are all handled inside `CategorySectionWrapper` (client-side via `@umg/api` hooks), not here.
- **Difference vs echo-media:** EM maps only 3 categories using types 1–3; IS uses all five layout variants including `type4` and `type4-text`. The component structure is otherwise identical.

---
*Documented at commit 1cbdce5.*
