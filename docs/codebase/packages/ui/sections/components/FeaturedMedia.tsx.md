# packages/ui/sections/components/FeaturedMedia.tsx

**Purpose:** Featured image / gallery carousel with a fullscreen lightbox — the hero media block used by sections and article pages.

## Responsibilities
- Normalizes `images: string | string[]`; one image renders a single 3:2 `next/image` (`fill`), 2+ renders a gallery with prev/next arrows that wrap around and a `[current/total]` pagination indicator.
- Portrait detection on load switches `object-cover` → `object-contain` (black letterbox background).
- Clicking opens a fullscreen lightbox (`bg-black/90`, `object-contain`, 90vw/85vh): close button, click-outside to close, Escape to close, arrow keys to navigate (gallery), spinner while each image loads; body scroll is locked while open.
- Inline gallery shows its own loading spinner during image transitions.

## Key exports
- `FeaturedMedia({ images, alt })` (default).

## Dependencies
- Internal: none
- External: `react`, `next/image`

## Used by
- [SectionType1](../SectionType1.tsx.md), [SectionType2](../SectionType2.tsx.md), [SectionType3](../SectionType3.tsx.md) (featured media), and [../../article/ArticleLayout.tsx](../../article/ArticleLayout.tsx.md) (article hero). Exported from the package barrel.

## Notes
- `"use client"`; adds/removes a window `keydown` listener and toggles `document.body.style.overflow` while the lightbox is open.
- Whether it gets a string or an array is decided upstream by `getGalleryImages()` in [transformers.ts](../../../api/transformers.ts.md) (or by ArticleLayout's `images.length > 1` check).
- Remote image hosts must be whitelisted in the app's `next.config.ts`.

---
*Documented at commit 1cbdce5.*
