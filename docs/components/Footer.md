# Footer Component

## Overview

The Footer component (`packages/ui/Footer.tsx`) is a responsive site footer with two main rows: a centered logo and a content area with media company links, category navigation, and meta links. Fully parameterized — each app passes its own data via props.

## Props

```typescript
interface FooterProps {
  logoUrl: string;              // URL to the site logo image
  logoAlt: string;              // Alt text for the logo
  categories: NavCategory[];    // All categories (sorted and split internally)
  companies: BannerCompany[];   // Sibling media companies
  email: string;                // Contact email address
  copyright: string;            // Copyright text (e.g., "© 2025 Echo Media")
  socials?: { platform: string; url: string }[]; // Social media links (optional)
}
```

`NavCategory` and `BannerCompany` types are imported from `Header.tsx`.

### Social Media Icons

The `socials` prop accepts an array of platform/url pairs. Built-in icons are provided for:
- `x` — X (formerly Twitter) icon
- `instagram` — Instagram icon

Icons are rendered as inline SVGs (24x24 viewBox, `w-5 h-5`). They appear in the meta column (desktop: right-aligned, mobile: centered) between the Contact Us link and copyright text.

## Layout

### Row 1: Big Logo
- Centered site logo (links to homepage)
- Height: `h-12`
- Padding: `py-8`

### Row 2: Content Area

#### Desktop Layout (LG+, 1024px+)
4 columns with vertical dividers:

| Column | Content | Alignment |
|--------|---------|-----------|
| 1 | Media company logos (B&W) | Left |
| 2 | Categories (left half, alphabetical) | Left |
| 3 | Categories (right half, alphabetical) | Right |
| 4 | About Us, Contact Us, Social icons, Copyright | Right |

#### Mobile/Tablet Layout (Below LG)
3 stacked rows, centered:

| Row | Content |
|-----|---------|
| 1 | Media company logos (B&W, vertical stack) |
| 2 | Categories (two columns, centered) |
| 3 | About Us, Contact Us, Social icons, Copyright |

## Category Sorting

Categories are sorted alphabetically internally and split into two columns:

```typescript
const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));
const midpoint = Math.ceil(sortedCategories.length / 2);
const leftCategories = sortedCategories.slice(0, midpoint);
const rightCategories = sortedCategories.slice(midpoint);
```

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Default | < 1024px | 3 stacked rows |
| lg | 1024px+ | 4 columns with dividers |

### Category Spacing (Mobile/Tablet)
- Default (< 768px): `gap-24` (6rem)
- md (768px+): `gap-40` (10rem)

## Component Structure

```
Footer
├── Row 1: Logo Area (py-8)
│   └── max-w-325 centered container
│       └── Centered logo (h-12) → links to /
│
└── Row 2: Content Area (py-8)
    └── max-w-325 centered container
        │
        ├── Desktop (lg:flex, hidden below)
        │   ├── Col 1: Media logos (B&W, vertical stack)
        │   ├── Divider (border-l mx-8)
        │   ├── Col 2: Left categories
        │   ├── Col 3: Right categories (ml-auto text-right)
        │   ├── Divider (border-l mx-8)
        │   └── Col 4: About Us + Contact Us + Social icons + copyright
        │
        └── Mobile/Tablet (lg:hidden)
            ├── Row 1: Media logos (centered stack)
            ├── Row 2: Categories (justify-center gap-24 md:gap-40)
            └── Row 3: About Us + Contact Us + Social icons + copyright (centered)
```

## Styling Notes

### Container Width
- `max-w-325` (1300px), same as Header

### Per-App Background Color (CSS Variable)
The footer background is customizable per app via the `--footer-bg` CSS variable set in each app's `globals.css`. If not set, defaults to `transparent`.

```css
/* apps/echo-media/app/globals.css */
:root {
  --footer-bg: #d9ecf3; /* Light blue tint of #0281b3 */
}

/* apps/international-spectrum/app/globals.css */
:root {
  --footer-bg: #e8e6f2; /* Light purple tint of #655aa8 */
}
```

Applied via inline style: `style={{ backgroundColor: 'var(--footer-bg, transparent)' }}`

UMG does not set this variable, so its footer background remains transparent.

### Colors
- Text primary: `#404040`
- Text hover: `#212223`
- Text muted (copyright): `gray-500`
- Border: `gray-300`

### Logo Heights
- Media company logos: `h-8` (uses `logoBW` — B&W versions)
- Main site logo: `h-12`

### Links
- Category links: Navigate to `/#slug` (section anchors)
- Media company links: External (`target="_blank"`)
- About Us: Internal link to `/about-us`
- Contact Us: `mailto:` link using `email` prop

## Usage

```tsx
// apps/echo-media/app/layout.tsx
import { Footer } from "@umg/ui";
import { allCategories } from "@/lib/categories";
import { mediaCompanies } from "@/lib/mediaCompanies";

<Footer
  logoUrl="/logo.svg"
  logoAlt="Echo Media"
  categories={allCategories}
  companies={mediaCompanies}
  email="info@echo-media.info"
  copyright="© 2025 Echo Media"
/>
```

```tsx
// apps/umg/app/layout.tsx — with social media icons
<Footer
  logoUrl="/umg-masthead.svg"
  logoAlt="United Media Group"
  categories={navCategories}
  companies={mediaCompanies}
  email="info@unitedmediadc.com"
  copyright="© 2026 United Media Group"
  socials={[
    { platform: "x", url: "https://x.com/unitedmediadc" },
    { platform: "instagram", url: "https://instagram.com/unitedmediadc" },
  ]}
/>
```

## Files

| File | Purpose |
|------|---------|
| `packages/ui/Footer.tsx` | This component |
| `packages/ui/Header.tsx` | Exports `NavCategory`, `BannerCompany` types (used by Footer) |
| `packages/ui/index.ts` | Barrel export (`Footer`, `FooterProps`) |
| `apps/*/lib/categories.ts` | Per-app category configuration |
| `apps/*/lib/mediaCompanies.ts` | Per-app company data |
