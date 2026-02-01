# Header Component Documentation

## Overview

The Header component (`components/Header.tsx`) is a responsive, sticky navigation bar inspired by Reuters' design. It includes category navigation, search functionality, a mobile menu, and a scrolling logo banner featuring subsidiary media companies.

## Features

### 1. Sticky Header
- Fixed to top of viewport with `sticky top-0 z-50`
- White background with bottom border (`border-gray-300`)
- Max width of `max-w-325` (custom utility), centered

### 2. Logo
- UMG masthead logo (SVG from WordPress media library)
- Centered on mobile, left-aligned on desktop
- Links to homepage

### 3. Category Navigation
- Links to homepage sections via hash navigation (`/#slug`)
- Smooth scrolling behavior (see [Smooth Scrolling](#smooth-scrolling) section)
- Responsive visibility:
  - **md+ (768px+)**: Shows main categories (first 2) + "More" dropdown
  - **lg+ (1024px+)**: Additionally shows "Economy & Business" and "Diplomacy" in main nav
  - **Below md**: Hidden (uses mobile menu instead)

### 4. Search
- **Desktop**: Expandable search bar (click icon to expand)
  - Takes 50% width, right-aligned
  - Includes submit button and close button
  - Auto-focuses input when opened
  - Submits to `/search?search={query}` page
  - Hidden when on search page (search bar is on that page)
- **Mobile**: Search bar in mobile menu (75% width, centered)
  - Also hidden when on search page

### 5. Mobile Menu
- Full-screen overlay below header + banner
- Hamburger/close toggle button
- Contains:
  - Search bar at top (hidden on search page)
  - "Categories" header
  - Two-column grid of all 8 category links
  - "About Us" link at bottom

### 6. Logo Banner
- Positioned below main header, separated by border
- Scrolling marquee animation (20s loop)
- Pauses on hover
- Contains logos linking to subsidiary sites (from `lib/mediaCompanies.ts`):
  - Echo Media
  - International Spectrum Media
  - Diplomatic Watch Magazine
- Logos repeated 4x for seamless infinite loop

## Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Default | < 768px | Mobile menu, hamburger icon, centered logo |
| md | 768px+ | Desktop nav, search icon, left-aligned logo |
| lg | 1024px+ | Show "Economy & Business" and "Diplomacy" in main nav |

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
export const mainCategories = categories.slice(0, 2);      // Always visible on MD+
export const lgOnlyCategories = categories.slice(2, 4);    // Economy & Business, Diplomacy (LG+ only)
export const moreCategories = categories.slice(4);         // Rest in "More" dropdown
export const allCategories = categories;                   // All for mobile menu

// Footer navigation - alphabetically sorted
export const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));
export const leftCategories = sortedCategories.slice(0, midpoint);
export const rightCategories = sortedCategories.slice(midpoint);
```

## Media Companies Configuration

Banner logos are defined in `lib/mediaCompanies.ts`:

```typescript
export interface MediaCompany {
  name: string;
  description: string;
  url: string;
  logo: string;      // Color logo for banner
  logoBW: string;    // Black/white logo for footer
}

export const mediaCompanies: MediaCompany[] = [
  {
    name: "Echo Media",
    url: "https://www.echo-media.info/",
    logo: "https://www.unitedmediadc.com/wp-content/uploads/...",
    // ...
  },
  // ... International Spectrum, Diplomatic Watch
];
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

## Search Integration

The header integrates with the `/search` page:

```typescript
const handleSearchSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (searchQuery.trim()) {
    router.push(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
    closeSearch();
  }
};
```

When on the search page (`isSearchPage = pathname === "/search"`):
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
│   │   ├── Main Categories (2 links)
│   │   ├── LG-Only Categories (lg+, 2 links)
│   │   └── More Dropdown
│   │       ├── LG-Only Categories (below lg)
│   │       └── Remaining Categories (4 links)
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
    ├── Two-Column Category Grid (8 links)
    └── About Us Link
```

## Styling Notes

### Colors
- Text primary: `#212223`
- Text secondary: `#404040`
- Text muted: `#5d5d5d`
- Border: `border-gray-300` (consistent with all components)
- Search button: `#8b8b8b` (hover: `#6b6b6b`)

### Z-Index Layers
- Header: `z-50`
- More dropdown: `z-50`
- Mobile menu: `z-50`

## Dependencies

- `next/link` - Client-side navigation
- `next/navigation` - `usePathname`, `useRouter` hooks
- React hooks: `useState`, `useRef`, `useEffect`
- `lib/categories.ts` - Category configuration
- `lib/mediaCompanies.ts` - Media company logos and URLs

## Files

| File | Purpose |
|------|---------|
| `components/Header.tsx` | Main header component |
| `lib/categories.ts` | Shared category configuration |
| `lib/mediaCompanies.ts` | Media company data for banner |
| `app/globals.css` | Marquee animation, smooth scroll CSS |
