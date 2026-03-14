# CategoryLabel Component

## Overview

The CategoryLabel component (`packages/ui/sections/CategoryLabel.tsx`) is a shared component that renders the category name header for each section on the homepage. It supports optional icon, text color, and underline — each feature is independent.

## Purpose

Replaces inline category label markup that was previously duplicated across all section types. Provides a single, consistent category header with per-app customization:
- **Echo Media / International Spectrum**: Colored text with `" >"` arrow suffix
- **UMG**: Black text with colored underline, no arrow

## Props

```typescript
interface CategoryLabelProps {
  category: string;                // Display name (e.g., "World News & Politics")
  slug?: string;                   // Category slug — wraps label in <Link> to /category/[slug]
  categoryColor?: string;          // Hex color for text (fallback when categoryTextColor not set)
  categoryTextColor?: string;      // Independent text color (takes priority over categoryColor)
  categoryUnderlineColor?: string; // Colored underline below the text (e.g., "#33bbff")
  categoryIcon?: string;           // Icon URL displayed to the left of the text
}
```

### Color Priority

Text color is resolved as: `categoryTextColor || categoryColor || "#000"` (black default).

### Arrow Suffix

The `" >"` arrow is shown only when none of the customization props are set (`categoryUnderlineColor`, `categoryIcon`, `categoryTextColor`). This preserves the default style for apps that don't customize the label.

## Rendered Output

```
┌─────────────────────────────────────────┐
│ [icon] Category Name                    │
│        ──────────────  (underline)      │
└─────────────────────────────────────────┘
```

- **Icon**: `<img>` tag, `h-4 w-4`, only rendered when `categoryIcon` is set
- **Text**: `text-sm font-bold`, inline `color` style
- **Underline**: `border-b-3` with inline `borderColor`, only when `categoryUnderlineColor` is set
- **Container**: `mb-4 flex items-center gap-2`

## Features

Each feature is independent — you can use any combination:

| Feature | Prop | Effect |
|---------|------|--------|
| Link | `slug` | Wraps label in `<Link href="/category/{slug}">` with hover effects |
| Icon | `categoryIcon` | Small image to the left of the text |
| Text color | `categoryTextColor` or `categoryColor` | Custom text color (inline style) |
| Underline | `categoryUnderlineColor` | Colored bottom border on the text |
| Arrow | (none — automatic) | `" >"` suffix when no customization props are set |

### Link Behavior

When `slug` is provided, the entire label is wrapped in a `<Link href="/category/{slug}">`. The hover styles depend on the label style:

| Label Style | Hover Effect |
|-------------|-------------|
| With underline (`categoryUnderlineColor` set) | `opacity-70` transition |
| Without underline (arrow case) | Shows underline in text color (`textDecorationColor` matches text) |

When `slug` is omitted, the label renders as plain text (no link), preserving backward compatibility.

## Usage

### By Section Components (internal)

```tsx
// Used by SectionType1-4, SectionSkeleton, SectionError
import CategoryLabel from "./CategoryLabel";

<CategoryLabel
  category={category}
  slug={slug}
  categoryColor={categoryColor}
  categoryTextColor={categoryTextColor}
  categoryUnderlineColor={categoryUnderlineColor}
  categoryIcon={categoryIcon}
/>
```

### Per-App Examples

```tsx
// Echo Media — colored text with arrow
<CategorySectionWrapper
  slug="artculture"
  category="Art & Culture"
  sectionType="type1"
  categoryColor="#0281b3"
/>
// Renders: "Art & Culture >" in blue

// UMG — black text with colored underline
<CategorySectionWrapper
  slug="world-news-politics"
  category="World News & Politics"
  sectionType="type1"
  categoryUnderlineColor="#33bbff"
/>
// Renders: "World News & Politics" in black with blue underline
```

## Used By

| Component | File |
|-----------|------|
| SectionType1 | `packages/ui/sections/SectionType1.tsx` |
| SectionType2 | `packages/ui/sections/SectionType2.tsx` |
| SectionType3 | `packages/ui/sections/SectionType3.tsx` |
| SectionType4 | `packages/ui/sections/SectionType4.tsx` |
| SectionSkeleton | `packages/ui/sections/SectionSkeleton.tsx` |
| SectionError | `packages/ui/sections/SectionError.tsx` |

## Files

| File | Purpose |
|------|---------|
| `packages/ui/sections/CategoryLabel.tsx` | This component |
| `packages/ui/sections/CategorySectionWrapper.tsx` | Passes all category label props to section types |
