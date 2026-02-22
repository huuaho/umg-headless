# FeaturedMedia Component

## Overview

The FeaturedMedia component (`packages/ui/sections/components/FeaturedMedia.tsx`) is a shared media display component used by SectionType 1-4 and ArticleLayout. It renders either a single image or a gallery carousel with navigation, and supports a fullscreen lightbox with dark overlay.

## Purpose

This component provides a unified way to display featured article media:
- **Single image**: When given a string or single-item array
- **Gallery carousel**: When given an array with 2+ images
- **Lightbox**: Clicking any image opens a fullscreen view with `bg-black/90` overlay

## Props

```typescript
interface FeaturedMediaProps {
  images: string | string[];  // Single image URL or array of URLs
  alt: string;                // Alt text for images (typically article title)
}
```

## Behavior

| Input | Output |
|-------|--------|
| `"https://example.com/image.jpg"` | Single image (clickable for lightbox) |
| `["https://example.com/image.jpg"]` | Single image (clickable for lightbox) |
| `["url1.jpg", "url2.jpg", "url3.jpg"]` | Gallery with navigation + lightbox |

## Vertical Image Detection

Both single image and gallery modes detect vertical (portrait) images on load. When `naturalHeight > naturalWidth`, the image switches from `object-cover` to `object-contain` so the full image is visible with a `bg-black` background (letterboxing). This prevents portrait images from being awkwardly cropped.

## Single Image Mode

When `images` is a string or single-item array:

```
┌─────────────────────────────────────────┐
│                                         │
│          Image (cursor: zoom-in)        │
│             (aspect 3:2)                │
│                                         │
└─────────────────────────────────────────┘
```

- Displays image at 3:2 aspect ratio with `bg-black` background
- Uses Next.js `Image` component with `fill` and `object-cover` (or `object-contain` for vertical images)
- `cursor-zoom-in` on hover
- Click opens lightbox
- No navigation controls

## Gallery Mode

When `images` has 2+ items:

```
┌─────────────────────────────────────────┐
│                                         │
│          Image (cursor: zoom-in)        │
│             (aspect 3:2)                │
│         [spinner while loading]         │
│                                         │
├─────────────────────────────────────────┤
│ [1/3]                          < >      │
└─────────────────────────────────────────┘
```

### Features

- **Pagination tracker**: `[currentIndex/total]` format (e.g., `[1/3]`)
- **Navigation arrows**: Previous/Next buttons
- **Wrap-around**: Navigating past the last image goes to first, and vice versa
- **Loading spinner**: Gray spinner on `bg-gray-100` while image loads, image fades in with 300ms transition
- **Responsive padding**: Controls have `px-6` on mobile, `lg:px-0` on desktop
- **Click opens lightbox**

## Lightbox

Clicking any image (single or gallery) opens a fullscreen lightbox overlay:

```
┌─────────────────────────────────────────────────┐
│ (bg-black/90 overlay)                     [X]   │
│                                                  │
│  <   ┌─────────────────────────────────┐    >    │
│      │                                 │         │
│      │      Image (object-contain)     │         │
│      │      [spinner while loading]    │         │
│      │                                 │         │
│      └─────────────────────────────────┘         │
│                                                  │
│                   [1/3]                          │
└─────────────────────────────────────────────────┘
```

### Close Methods
- Click the **X button** (top-right)
- Click the **dark background** (anywhere outside image)
- Press **Escape** key

### Navigation (gallery only)
- **Left/Right arrow buttons** on screen
- **ArrowLeft / ArrowRight** keyboard keys
- **Pagination** `[n/total]` at bottom center

### Loading States
- **Spinner**: White spinning circle centered on dark background while image loads
- **Fade-in**: Image transitions from `opacity-0` to `opacity-100` (300ms) once loaded
- **Resets on navigation**: Each image change shows spinner until new image loads
- **Resets on open**: Opening lightbox shows spinner for initial image

### Scroll Lock
- `document.body.style.overflow = "hidden"` while lightbox is open
- Restored on close via effect cleanup

### Pointer Events
- Image container uses `pointer-events-none` so clicks pass through to the overlay for closing
- Navigation arrows use `e.stopPropagation()` to prevent closing when clicked

## Component Structure

```
FeaturedMedia
├── [Single Image Mode]
│   ├── Image container (aspect-3/2, bg-black, cursor-zoom-in)
│   │   └── Next.js Image (fill, object-cover or object-contain for vertical)
│   └── Lightbox (when open)
│
└── [Gallery Mode]
    ├── Image container (aspect-3/2, bg-black, cursor-zoom-in)
    │   ├── Loading spinner (bg-gray-100, shown while loading)
    │   └── Next.js Image (fill, object-cover or object-contain, fade transition)
    ├── Navigation bar
    │   ├── Pagination tracker [n/total]
    │   └── Arrow buttons
    │       ├── Previous (chevron-left)
    │       └── Next (chevron-right)
    └── Lightbox (when open)
        ├── Dark overlay (bg-black/90, click to close)
        ├── Close button (top-right, X icon)
        ├── Previous arrow (left, gallery only)
        ├── Image container (max-w-[90vw], max-h-[85vh])
        │   ├── Loading spinner (white on dark)
        │   └── Image (object-contain, fade transition)
        ├── Next arrow (right, gallery only)
        └── Pagination (bottom center, gallery only)
```

## State

```typescript
const [currentIndex, setCurrentIndex] = useState(0);      // Current gallery image
const [lightboxOpen, setLightboxOpen] = useState(false);   // Lightbox visibility
const [lightboxLoading, setLightboxLoading] = useState(true);  // Lightbox image loading
const [inlineLoading, setInlineLoading] = useState(false);     // Inline gallery image loading
const [isVertical, setIsVertical] = useState(false);           // Whether current image is portrait orientation
```

## Styling

### Image Container
- Aspect ratio: `aspect-3/2` (3:2)
- Background: `bg-black` (visible when vertical images use `object-contain`)
- Width: `w-full`
- Cursor: `cursor-zoom-in`

### Navigation Bar
- Layout: `flex items-center justify-between`
- Padding: `py-2 px-6 lg:px-0`
- Pagination text: `text-sm text-gray-500`
- Arrow buttons: `text-gray-600 hover:text-black`

### Inline Loading Spinner
- Background: `bg-gray-100`
- Spinner: `w-8 h-8 border-3 border-gray-300 border-t-gray-600`

### Lightbox
- Overlay: `fixed inset-0 z-50 bg-black/90`
- Close button: `text-white/70 hover:text-white`, `w-8 h-8`
- Nav arrows: `text-white/70 hover:text-white`, `w-10 h-10`
- Pagination: `text-sm text-white/70`
- Lightbox spinner: `w-10 h-10 border-3 border-white/30 border-t-white`

## Usage

### In Section Components

```tsx
// SectionType1.tsx, SectionType2.tsx, SectionType3.tsx
import FeaturedMedia from "./components/FeaturedMedia";

<FeaturedMedia images={featured.gallery} alt={featured.title} />
```

### In ArticleLayout

```tsx
// article/ArticleLayout.tsx
import FeaturedMedia from "../sections/components/FeaturedMedia";

<FeaturedMedia
  images={images.length > 1 ? images : images[0]}
  alt={title}
/>
```

## Responsive Behavior

The component itself is width-agnostic (`w-full`). Parent components control the width and handle edge-to-edge bleeding on mobile:

```tsx
// In SectionType1.tsx
<div className="mt-4 2xl:mt-0 -mx-6 lg:mx-0 2xl:w-2/3">
  <FeaturedMedia images={featured.gallery} alt={featured.title} />
</div>

// In ArticleLayout.tsx
<div className="mb-8 -mx-6 md:mx-0">
  <FeaturedMedia images={images.length > 1 ? images : images[0]} alt={title} />
</div>
```

## Dependencies

- `next/image` — Optimized image loading
- `react` — `useState`, `useEffect`, `useCallback`

## Files

| File | Purpose |
|------|---------|
| `packages/ui/sections/components/FeaturedMedia.tsx` | This component |
| `packages/ui/sections/SectionType1.tsx` | Uses with gallery arrays |
| `packages/ui/sections/SectionType2.tsx` | Uses with single images |
| `packages/ui/sections/SectionType3.tsx` | Uses with single images |
| `packages/ui/article/ArticleLayout.tsx` | Uses with image arrays |
