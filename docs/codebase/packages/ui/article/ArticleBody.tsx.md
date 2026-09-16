# packages/ui/article/ArticleBody.tsx

**Purpose:** Renders an article body from ordered content blocks, keeping every image in the position the author gave it in WordPress.

## Responsibilities
- Maps over `ContentBlock[]` ([packages/api/content.ts](../../api/content.ts.md)) and renders each block in source order:
  - `html` → a Tailwind `prose` container via `dangerouslySetInnerHTML`.
  - `gallery` → [FeaturedMedia](../sections/components/FeaturedMedia.tsx.md) (carousel with lightbox when 2+ images, single image otherwise), full-bleed on mobile via `-mx-6 md:mx-0`.
  - `image` → a `<figure>` inside the article column at natural aspect ratio, with an optional `<figcaption>`.
- Gives the first block the hero treatment when `leadBlockIsHero` is set: an `image` lead renders through FeaturedMedia (3:2, click-to-zoom) instead of as a plain figure.

## Key exports
- `ArticleBody({ blocks, title, leadBlockIsHero })` (default).

## Dependencies
- Internal: [../sections/components/FeaturedMedia.tsx](../sections/components/FeaturedMedia.tsx.md), [@umg/api](../../api/content.ts.md) (type-only `ContentBlock`)
- External: `react`, `next/image`

## Used by
- [ArticleLayout](ArticleLayout.tsx.md) — the only consumer. It passes `leadBlockIsHero={false}` when a YouTube embed has already claimed the hero slot.

## Notes
- `"use client"` component (FeaturedMedia owns carousel/lightbox state).
- Galleries render **in place**, not forced to the end. Editors already put them last in ~122 of the 135 live posts that have one, so honouring source order produces the "gallery at the end" layout while still handling the handful of gallery-first posts as authored.
- Non-hero single images deliberately skip FeaturedMedia: they keep their natural aspect ratio rather than being cropped to 3:2, at the cost of no lightbox. The hero and galleries remain clickable.
- `alt` falls back to the article title — WP carries no alt text on any of the ~400 live images, so real alt text has to come from the editors.
- Images render through `next/image` with `w-full h-auto`; all three apps set `images.unoptimized: true` for static export, so this emits a plain `<img>` with no optimization layer.

---
*Documented at commit e636e60.*
