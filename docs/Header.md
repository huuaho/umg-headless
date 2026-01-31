# Header Component Documentation

## Overview

The Header component (`components/Header.tsx`) is a responsive, sticky navigation bar inspired by Reuters' design. It includes category navigation, search functionality, a mobile menu, and a scrolling logo banner.

## Features

### 1. Sticky Header
- Fixed to top of viewport with `sticky top-0 z-50`
- White background with bottom border
- Max width of 1440px, centered

### 2. Category Navigation
- Links to homepage sections via hash navigation (`/#slug`)
- Smooth scrolling behavior (see [Smooth Scrolling](#smooth-scrolling) section)
- Responsive visibility:
  - **md+ (768px+)**: Shows main categories + "More" dropdown
  - **lg+ (1024px+)**: Additionally shows "Diplomacy" in main nav
  - **Below md**: Hidden (uses mobile menu instead)

### 3. Search
- Desktop: Expandable search bar (click icon to expand)
  - Takes 50% width, right-aligned
  - Includes submit button and close button
  - Auto-focuses input when opened
- Mobile: Search bar in mobile menu (75% width, centered)

### 4. Mobile Menu
- Full-screen overlay below header + banner
- Hamburger/close toggle button
- Contains:
  - Search bar at top
  - "Categories" header
  - Two-column grid of all category links

### 5. Logo Banner
- Positioned below main header, separated by border
- Scrolling marquee animation (20s loop)
- Pauses on hover
- Contains logos linking to subsidiary sites:
  - Echo Media (https://www.echo-media.info/)
  - International Spectrum (https://www.internationalspectrum.org/)
  - Diplomatic Watch (https://diplomaticwatch.com/)

## Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Default | < 768px | Mobile menu, hamburger icon |
| md | 768px+ | Desktop nav, search icon, hide hamburger |
| lg | 1024px+ | Show "Diplomacy" in main nav (not just dropdown) |

## Categories Configuration

Categories are defined in `lib/categories.ts` and shared across components:

```typescript
export interface Category {
  name: string;
  slug: string;
  color: string; // Tailwind bg color class
}

export const categories: Category[] = [
  { name: "World News & Politics", slug: "world-news-politics", color: "bg-blue-100" },
  { name: "Profiles & Opinions", slug: "profiles-opinions", color: "bg-green-100" },
  { name: "Economy & Business", slug: "economy-business", color: "bg-yellow-100" },
  { name: "Diplomacy", slug: "diplomacy", color: "bg-purple-100" },
  { name: "Art & Culture", slug: "art-culture", color: "bg-pink-100" },
  { name: "Education & Youth", slug: "education-youth", color: "bg-orange-100" },
  { name: "Local Community", slug: "local-community", color: "bg-teal-100" },
  { name: "Wellbeing, Environment, Technology", slug: "wellbeing-env-tech", color: "bg-indigo-100" },
];

// Header navigation splits
export const mainCategories = categories.slice(0, 3);  // First 3 always visible
export const lgOnlyCategory = categories[3];           // Diplomacy (lg+ only)
export const moreCategories = categories.slice(4);     // Rest in "More" dropdown
export const allCategories = categories;               // All for mobile menu
```

## Smooth Scrolling

### Problem
Next.js `Link` component handles navigation programmatically, bypassing CSS `scroll-behavior: smooth`.

### Solution
Custom JavaScript scroll handler with three parts:

#### 1. CSS Base (`globals.css`)
```css
html {
  scroll-behavior: smooth;
}
```

#### 2. Same-Page Scrolling
```typescript
const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
  if (pathname === "/") {
    e.preventDefault();
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }
};
```

#### 3. Cross-Page Navigation
```typescript
useEffect(() => {
  if (pathname === "/" && window.location.hash) {
    const slug = window.location.hash.slice(1);
    const element = document.getElementById(slug);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }
}, [pathname]);
```

#### 4. Disable Next.js Auto-Scroll
All category links use `scroll={false}` to prevent Next.js from jumping to hash:
```tsx
<Link href={`/#${category.slug}`} scroll={false} onClick={(e) => scrollToSection(e, category.slug)}>
```

### Scroll Offset
Category sections use `scroll-mt-24` class to account for sticky header height.

## Component Structure

```
Header
├── Main Header (h-14)
│   ├── Logo (w-35, left)
│   ├── Desktop Navigation (md+, centered)
│   │   ├── Main Categories (3 links)
│   │   ├── Diplomacy (lg+ only)
│   │   └── More Dropdown
│   │       ├── Diplomacy (below lg)
│   │       └── Remaining Categories
│   ├── Desktop Search Icon (md+, w-35, right)
│   ├── Desktop Search Expanded (replaces nav when open)
│   └── Mobile Hamburger (below md)
│
├── Logo Banner (h-10)
│   └── Marquee Scrolling Logos
│
└── Mobile Menu (full screen overlay, below md)
    ├── Search Bar
    ├── Categories Header
    └── Two-Column Category Grid
```

## Styling Notes

### Colors
- Text primary: `#212223`
- Text secondary: `#404040`
- Text muted: `#5d5d5d`
- Border: `gray-300` (Tailwind class, consistent with section component borders)
- Search button: `#8b8b8b` (hover: `#6b6b6b`)

### Z-Index Layers
- Header: `z-50`
- More dropdown: `z-50`
- Mobile menu: `z-50`

## Dependencies

- `next/link` - Client-side navigation
- `next/navigation` - `usePathname` hook
- React hooks: `useState`, `useRef`, `useEffect`

## Files

| File | Purpose |
|------|---------|
| `components/Header.tsx` | Main header component |
| `lib/categories.ts` | Shared category configuration |
| `app/globals.css` | Marquee animation, smooth scroll CSS |
