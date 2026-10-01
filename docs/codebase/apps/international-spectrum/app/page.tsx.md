# apps/international-spectrum/app/page.tsx

**Purpose:** Homepage — a recency-based "Latest" section followed by one article section per category, all using the shared `CategorySectionWrapper`.

## Responsibilities
Renders a **"Latest" section first** (`<CategorySectionWrapper latest slug="latest" category="Latest" sectionType="type1" />`) — the newest posts across all categories, articles and video interviews mixed, in the featured + 4 secondary layout. Then maps over the app's six categories and renders a `CategorySectionWrapper` for each, choosing a layout via a local `SECTION_TYPE_MAP` (slug → section type). Everything is wrapped in `SeenArticlesProvider` so category sections deduplicate articles across each other (the `priority={index}` prop gives earlier sections first claim). The Latest section is deliberately rendered *without* `priority`, so it does not participate in dedup: category sections below are unaffected and may repeat items shown in Latest.

## Key exports
- `Home() -> JSX` — default export; the `/` route.

## Dependencies
- Internal: [lib/categories.ts](../lib/categories.ts.md) (`categories`, via `@/lib`), [@umg/ui CategorySectionWrapper](../../../packages/ui/sections/CategorySectionWrapper.tsx.md), [@umg/ui SeenArticlesContext](../../../packages/ui/SeenArticlesContext.tsx.md) (`SeenArticlesProvider`, `SectionType` type)
- External: `react`

## Used by
Next.js App Router — the `/` route.

## Notes
- `SECTION_TYPE_MAP`: `communitypublicprograms → type1`, `civicandculturalaffairs → type2`, `arts → type3`, `historylegacy → type4`, `socialimpactjustice → type1`, `video-interviews → type4`; unmapped slugs fall back to `type1`. The map also still carries `leadershipyouthengagement → type4-text`, which is **dead** — that category was deleted in the 2026-09-15 renames (`2354375`), so nothing ever looks the key up and `type4-text` is unreachable on this site. Harmless, but it is the only reason the map looks like it has 7 entries for 6 categories.
- Data fetching, loading skeletons, and error/retry states are all handled inside `CategorySectionWrapper` (client-side via `@umg/api` hooks), not here.
- The Latest section's label is unlinked (there is no `/category/latest` route — [category/[slug]](category/[slug]/page.tsx.md) only pre-renders slugs from `lib/categories.ts`, which is intentionally left untouched so header/footer nav are unaffected).
- **Difference vs echo-media / umg:** EM maps only 3 categories using types 1–3; IS reaches `type1`–`type4` (not `type4-text`, whose only mapping is the dead entry above), and is currently the only app with a "Latest" section. The component structure is otherwise identical.

---
*Documented at commit 6e04fee.*
