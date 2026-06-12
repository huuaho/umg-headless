# packages/config/dummyData.ts

**Purpose:** Hardcoded sample section data (fake headlines + picsum.photos images) for developing/previewing the homepage section layouts without a live API.

## Responsibilities
Provides one fully-populated constant per homepage section layout, typed with the same `SectionData` / `SectionType4Data` shapes the real transformers produce, so a section component can be rendered with static props.

## Key exports
- `sectionType1Data: SectionData` — featured (3-image gallery) + 4 secondary.
- `sectionType2Data: SectionData` — featured (single image) + 4 secondary.
- `sectionType3Data: SectionData` — featured (single image) + 3 secondary.
- `sectionType4Data: SectionType4Data` — 4 articles with images.
- `sectionType4TextOnlyData: SectionType4Data` — 4 articles, text only.

## Dependencies
- Internal: `@umg/api` types ([../api/types.ts](../api/types.ts.md))
- External: none (image URLs point to picsum.photos)

## Used by
Re-exported via [index.ts](index.ts.md). No app code currently imports `@umg/config` exports — the apps declare it as a dependency and list it in `transpilePackages`, but the homepage sections now fetch live data through [CategorySectionWrapper](../ui/sections/CategorySectionWrapper.tsx.md). Effectively a development/legacy fixture.

## Notes
- All `url` fields are `"#"` and no `slug`s are set, so links are inert/external when rendered.
- Safe to use as a visual fixture for the section components in [../ui/sections/](../ui/sections/README.md).

---
*Documented at commit 1cbdce5.*
