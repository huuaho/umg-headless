# Header Component

## Overview

The Header component (`packages/ui/Header.tsx`) is a responsive, sticky navigation bar. It includes category navigation, search functionality, a mobile menu, and a scrolling logo banner. Fully parameterized — each app passes its own logo, categories, and banner companies via props.

## Props

```typescript
interface HeaderProps {
  logoUrl: string;           // URL to the site logo image
  logoAlt: string;           // Alt text for the logo
  categories: NavCategory[]; // Navigation categories
  bannerCompanies: BannerCompany[]; // Companies displayed in the scrolling banner
}

interface NavCategory {
  name: string;  // Display name (e.g., "Art & Culture")
  slug: string;  // URL slug (e.g., "artculture")
}

interface BannerCompany {
  name: string;
  url: string;
  logo: string;     // Color logo for banner
  logoBW: string;   // Black/white logo for footer
}
```

## Features

### 1. Sticky Header
- Fixed to top of viewport with `sticky top-0 z-50`
- White background with bottom border (`border-gray-300`)
- Max width of `max-w-325` (custom utility), centered

### 2. Logo
- Centered on mobile, left-aligned on desktop
- Links to homepage
- Height: `h-8`

### 3. Category Navigation
- Links to homepage sections via hash navigation (`/#slug`)
- Smooth scrolling behavior (see [Smooth Scrolling](#smooth-scrolling) section)
- Responsive visibility computed from the `categories` array:
  - First 2 categories: always visible on md+
  - Categories 3-4: visible on lg+ in main nav, shown in "More" dropdown below lg
  - Categories 5+: always in "More" dropdown
  - Below md: hidden (uses mobile menu instead)

### 4. Search
- **Desktop**: Expandable search bar (click icon to expand)
  - Takes 50% width, right-aligned
  - Auto-focuses input when opened
  - Submits to `/search?search={query}`
  - Hidden when on search page
- **Mobile**: Search bar in mobile menu (75% width, centered)
  - Also hidden when on search page

### 5. Mobile Menu
- Full-screen overlay below header + banner
- Hamburger/close toggle button
- Contains:
  - Search bar at top (hidden on search page)
  - "Categories" header
  - Two-column grid of all category links
  - "About Us" link at bottom

### 6. Logo Banner
- Positioned below main header, separated by border
- Scrolling marquee animation
- Contains logos linking to sibling company sites
- Logos repeated 4x for seamless infinite loop

## Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Default | < 768px | Mobile menu, hamburger icon, centered logo |
| md | 768px+ | Desktop nav, search icon, left-aligned logo |
| lg | 1024px+ | Show categories 3-4 in main nav |

## Smooth Scrolling

### Problem
Next.js `Link` component handles navigation programmatically, bypassing CSS `scroll-behavior: smooth`.

### Solution
Custom JavaScript scroll handler:

1. **Same-page**: `scrollToSection()` intercepts click, uses `scrollIntoView({ behavior: "smooth" })`
2. **Cross-page**: `useEffect` detects hash on homepage load, scrolls after 100ms delay
3. **Disable auto-scroll**: All category links use `scroll={false}` to prevent Next.js jumping

### Scroll Offset
Category sections use `scroll-mt-24` class to account for sticky header height.

## Search Integration

When on the search page (`pathname === "/search"`):
- Desktop search icon is hidden
- Desktop expanded search is hidden
- Mobile search bar in menu is hidden

## Component Structure

```
Header
├── Main Header (h-14)
│   ├── Mobile Left Spacer (w-8, balances hamburger for centered logo)
│   ├── Logo (centered mobile, left desktop)
│   ├── Desktop Navigation (md+, centered)
│   │   ├── Main Categories (first 2)
│   │   ├── LG-Only Categories (3-4, lg+ only)
│   │   └── More Dropdown
│   │       ├── LG-Only Categories (below lg)
│   │       └── Remaining Categories (5+)
│   ├── Desktop Search Icon (md+, right)
│   ├── Desktop Search Expanded (replaces nav when open)
│   └── Mobile Hamburger (below md)
│
├── Logo Banner (h-10)
│   └── Marquee Scrolling Logos (4x repeat)
│
└── Mobile Menu (full screen overlay, below md)
    ├── Search Bar (hidden on search page)
    ├── Categories Header
    ├── Two-Column Category Grid
    └── About Us Link
```

## Styling Notes

### Per-App Banner Border Color (CSS Variable)
The banner border lines (top border on header, top border on banner) are customizable per app via the `--banner-border-color` CSS variable set in each app's `globals.css`. If not set, defaults to `#d1d5db` (gray-300).

```css
/* apps/echo-media/app/globals.css */
:root {
  --banner-border-color: #0281b3; /* Blue */
}

/* apps/international-spectrum/app/globals.css */
:root {
  --banner-border-color: #feb70c; /* Yellow */
}
```

Applied via inline style on the `<header>` and banner `<div>`: `style={{ borderColor: 'var(--banner-border-color, #d1d5db)' }}`

UMG does not set this variable, so its borders remain the default gray.

### Colors
- Text primary: `#212223`
- Text secondary: `#404040`
- Text muted: `#5d5d5d`
- Border: `border-gray-300` (overridden by `--banner-border-color` on banner borders)
- Search button: `#8b8b8b` (hover: `#6b6b6b`)

### Z-Index Layers
- Header: `z-50`
- More dropdown: `z-50`
- Mobile menu: `z-50`

## Usage

Each app configures its own categories and banner companies:

```tsx
// apps/echo-media/app/layout.tsx
import { Header } from "@umg/ui";
import { navCategories } from "@/lib/categories";
import { mediaCompanies } from "@/lib/mediaCompanies";

<Header
  logoUrl="/logo.svg"
  logoAlt="Echo Media"
  categories={navCategories}
  bannerCompanies={mediaCompanies}
/>
```

Category and company data is defined per app in `apps/*/lib/categories.ts` and `apps/*/lib/mediaCompanies.ts`.

## Dependencies

- `next/link` — Client-side navigation
- `next/navigation` — `usePathname`, `useRouter` hooks
- React hooks: `useState`, `useRef`, `useEffect`

## Files

| File | Purpose |
|------|---------|
| `packages/ui/Header.tsx` | This component |
| `packages/ui/index.ts` | Barrel export (`Header`, `NavCategory`, `BannerCompany`, `HeaderProps`) |
| `apps/*/lib/categories.ts` | Per-app category configuration |
| `apps/*/lib/mediaCompanies.ts` | Per-app banner company data |
| `apps/*/app/globals.css` | Marquee animation, smooth scroll CSS |
