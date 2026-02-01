# FeaturedMedia Component

## Overview

The FeaturedMedia component (`components/sections/components/FeaturedMedia.tsx`) is a shared media display component used by SectionType 1, 2, and 3. It intelligently renders either a single image or a gallery carousel with navigation based on the input data.

## Purpose

This component provides a unified way to display featured article media:
- **Single image**: When given a string or single-item array
- **Gallery carousel**: When given an array with 2+ images

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
| `"https://example.com/image.jpg"` | Single image |
| `["https://example.com/image.jpg"]` | Single image |
| `["url1.jpg", "url2.jpg", "url3.jpg"]` | Gallery with navigation |

## Single Image Mode

When `images` is a string or single-item array:

```
┌─────────────────────────────────────────┐
│                                         │
│              Image                      │
│           (aspect 3:2)                  │
│                                         │
└─────────────────────────────────────────┘
```

- Displays image at 3:2 aspect ratio
- Uses Next.js `Image` component with `fill` and `object-cover`
- No navigation controls

## Gallery Mode

When `images` has 2+ items:

```
┌─────────────────────────────────────────┐
│                                         │
│              Image                      │
│           (aspect 3:2)                  │
│                                         │
├─────────────────────────────────────────┤
│ [1/3]                          < >      │
└─────────────────────────────────────────┘
```

### Features

- **Pagination tracker**: `[currentIndex/total]` format (e.g., `[1/3]`)
- **Navigation arrows**: Previous/Next buttons
- **Wrap-around**: Navigating past the last image goes to first, and vice versa
- **Responsive padding**: Controls have `px-6` on mobile, `lg:px-0` on desktop

### Navigation

```typescript
const goToPrevious = () => {
  setCurrentIndex((prev) => (prev === 0 ? imageArray.length - 1 : prev - 1));
};

const goToNext = () => {
  setCurrentIndex((prev) => (prev === imageArray.length - 1 ? 0 : prev + 1));
};
```

## Styling

### Image Container
- Aspect ratio: `aspect-3/2` (3:2)
- Width: `w-full`
- Position: `relative` (for Next.js Image fill)

### Navigation Bar
- Layout: `flex items-center justify-between`
- Padding: `py-2 px-6 lg:px-0`
- Pagination text: `text-sm text-gray-500`
- Arrow buttons: `text-gray-600 hover:text-black`

### Arrow Icons
- Size: `w-5 h-5`
- Chevron SVGs with `strokeWidth={2}`

## Usage

### In Section Components

```tsx
// SectionType1.tsx, SectionType2.tsx, SectionType3.tsx
import FeaturedMedia from "./components/FeaturedMedia";

<FeaturedMedia images={featured.gallery} alt={featured.title} />
```

### With Single Image (SectionType 2, 3)

```tsx
// featured.gallery = "https://example.com/image.jpg"
<FeaturedMedia images={featured.gallery} alt={featured.title} />
// Renders: Single image, no controls
```

### With Gallery (SectionType 1)

```tsx
// featured.gallery = ["url1.jpg", "url2.jpg", "url3.jpg"]
<FeaturedMedia images={featured.gallery} alt={featured.title} />
// Renders: Image carousel with [1/3] pagination and < > arrows
```

## Component Structure

```
FeaturedMedia
├── [Single Image Mode]
│   └── Image container (aspect-3/2)
│       └── Next.js Image (fill, object-cover)
│
└── [Gallery Mode]
    ├── Image container (aspect-3/2)
    │   └── Next.js Image (fill, object-cover)
    └── Navigation bar
        ├── Pagination tracker [n/total]
        └── Arrow buttons
            ├── Previous (chevron-left)
            └── Next (chevron-right)
```

## Responsive Behavior

The component itself is width-agnostic (`w-full`). Parent components control the width and handle edge-to-edge bleeding on mobile:

```tsx
// In SectionType1.tsx
<div className="mt-4 2xl:mt-0 -mx-6 lg:mx-0 2xl:w-2/3">
  <FeaturedMedia images={featured.gallery} alt={featured.title} />
</div>
```

- **Mobile**: Parent uses `-mx-6` to bleed image to viewport edges
- **Desktop (lg+)**: Parent uses `lg:mx-0` to contain within layout

The navigation bar padding (`px-6 lg:px-0`) matches this pattern to keep controls properly aligned.

## Dependencies

- `next/image` - Optimized image loading
- `react` - `useState` for gallery index

## Files

| File | Purpose |
|------|---------|
| `components/sections/components/FeaturedMedia.tsx` | This component |
| `components/sections/SectionType1.tsx` | Uses with gallery arrays |
| `components/sections/SectionType2.tsx` | Uses with single images |
| `components/sections/SectionType3.tsx` | Uses with single images |
