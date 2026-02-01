# Footer Component Documentation

## Overview

The Footer component (`components/Footer.tsx`) is a responsive site footer with two main rows: a centered logo and a content area with media company links, category navigation, and meta links.

## Structure

### Row 1: Big Logo
- Centered UMG masthead logo (black version)
- Links to homepage
- Height: `h-12`
- Padding: `py-8`

### Row 2: Content Area
Contains different layouts for desktop and mobile:

#### Desktop Layout (LG+, 1024px+)
4 columns with vertical dividers:

| Column | Content | Alignment |
|--------|---------|-----------|
| 1 | Media company logos | Left |
| 2 | Categories (left half, alphabetical) | Left |
| 3 | Categories (right half, alphabetical) | Right |
| 4 | Meta links + Copyright | Right |

#### Mobile/Tablet Layout (Below LG)
3 stacked rows:

| Row | Content | Layout |
|-----|---------|--------|
| 1 | Media company logos | Centered, vertical stack |
| 2 | Categories (two columns) | Centered with gap |
| 3 | Meta links + Copyright | Centered |

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Default | < 1024px | 3 stacked rows |
| lg | 1024px+ | 4 columns with dividers |

### Category Spacing (Mobile/Tablet)
- Default (< 768px): `gap-24` (6rem)
- md (768px+): `gap-40` (10rem)

## Categories Configuration

Categories are sorted alphabetically and split into two columns in `lib/categories.ts`:

```typescript
// Footer navigation - alphabetically sorted and split into two columns
export const sortedCategories = [...categories].sort((a, b) =>
  a.name.localeCompare(b.name)
);
const midpoint = Math.ceil(sortedCategories.length / 2);
export const leftCategories = sortedCategories.slice(0, midpoint);
export const rightCategories = sortedCategories.slice(midpoint);
```

Result (8 categories split into 4+4):
- **Left Column**: Art & Culture, Diplomacy, Economy & Business, Education & Youth
- **Right Column**: Local Community, Profiles & Opinions, Wellbeing/Env/Tech, World News & Politics

## Media Companies

Media company data is defined in `lib/mediaCompanies.ts`:

```typescript
export interface MediaCompany {
  name: string;
  url: string;
  logo: string;     // Color version
  logoBW: string;   // Black & white version (used in footer)
  description: string;
}

export const mediaCompanies: MediaCompany[] = [
  {
    name: "Diplomatic Watch Magazine",
    url: "https://diplomaticwatch.com/",
    logoBW: "https://www.unitedmediadc.com/wp-content/uploads/2025/12/DW-BW.svg",
    // ...
  },
  // Echo Media, International Spectrum Media
];
```

## Component Structure

```
Footer
├── Row 1: Logo Area (py-8)
│   └── max-w-325 centered container
│       └── Centered UMG logo (h-12) → links to /
│
└── Row 2: Content Area (py-8)
    └── max-w-325 centered container
        │
        ├── Desktop (lg:flex, hidden below)
        │   ├── Col 1: Media logos (vertical stack)
        │   ├── Divider (border-l mx-8)
        │   ├── Col 2: Left categories
        │   ├── Col 3: Right categories (ml-auto text-right)
        │   ├── Divider (border-l mx-8)
        │   └── Col 4: Meta links + copyright
        │
        └── Mobile/Tablet (lg:hidden)
            ├── Row 1: Media logos (centered stack)
            ├── Row 2: Categories (justify-center gap-24 md:gap-40)
            │   ├── Left column
            │   └── Right column (text-right)
            └── Row 3: Meta links (centered)
```

## Styling Notes

### Container Width
- Footer uses `max-w-325` (1300px) for content container
- Same as Header for consistency

### Colors
- Text primary: `#404040`
- Text hover: `#212223`
- Text muted (copyright): `gray-500`
- Border: `gray-300`

### Logo Height
- Media company logos: `h-8`
- Main UMG logo: `h-12`

### Links
- Category links: Navigate to `/#slug` (section anchors)
- Media company links: External (`target="_blank"`, `rel="noopener noreferrer"`)
- About Us: Internal link to `/about-us`
- Contact Us: `mailto:` link

## Dependencies

- `next/link` - Client-side navigation
- `@/lib/categories` - `leftCategories`, `rightCategories`
- `@/lib/mediaCompanies` - `mediaCompanies` array

## Files

| File | Purpose |
|------|---------|
| `components/Footer.tsx` | Main footer component |
| `lib/categories.ts` | Shared category configuration with footer splits |
| `lib/mediaCompanies.ts` | Media company data (names, URLs, logos) |
