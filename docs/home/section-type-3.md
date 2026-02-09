# Section Type 3

> **Development Approach**: Mobile-first. The mobile version is the primary focus of this website. Base styles target SM, then progressively enhance for MD, LG, and 2XL.

A news section featuring 4 articles: 1 featured (main) article with a single image and 3 secondary articles. Similar to Section Type 2 but with fewer secondary articles.

---

## File Structure

| File | Description |
|------|-------------|
| `packages/ui/sections/SectionType3.tsx` | Main component with SecondaryArticleCard sub-component |
| `packages/ui/sections/components/FeaturedMedia.tsx` | Shared media component (handles single image or gallery) |
| `packages/api/types.ts` | TypeScript interfaces (`FeaturedArticle`, `SecondaryArticle`, `SectionData`) |

---

## TypeScript Interfaces

```typescript
// packages/api/types.ts

export interface FeaturedArticle {
  title: string;
  snippet: string;
  time: string;
  gallery: string | string[]; // Single image or array for gallery carousel
  url: string;
  slug?: string;   // Present for internal articles (EM/IS), absent for external (UMG)
}

export interface SecondaryArticle {
  title: string;
  time: string;
  url: string;
  slug?: string;
}

export interface SectionData {
  featured: FeaturedArticle;
  secondary: SecondaryArticle[];
}

// Component props
interface SectionType3Props extends SectionData {
  slug: string;
  category: string;
  categoryColor?: string; // Hex color for category label (inline style), defaults to black
}
```

All article links use `ArticleLink` — renders `<Link>` for internal articles (slug present) or `<a target="_blank">` for external (slug absent). See [../components/ArticleLink.md](../components/ArticleLink.md).

---

## Content Structure

### Featured Article
- **Category**: Category name displayed as section label (e.g., "Economy & Business >")
- **Title**: Large headline (responsive sizing with dynamic adjustment at LG+)
- **Snippet**: Brief excerpt from the article
- **Time**: Reading time (e.g., "6 min read")
- **Image**: Single image via FeaturedMedia component (aspect ratio 3:2)

### Secondary Articles (x3)
- **Title**: Headline only
- **Time**: Reading time (e.g., "X min read")

---

## Key Differences from Section Type 2

| Feature | Section Type 2 | Section Type 3 |
|---------|---------------|----------------|
| Total articles | 5 (1 + 4) | 4 (1 + 3) |
| SM secondary | 4 rows | 3 rows |
| MD secondary | 2x2 grid | 1 row, 3 columns |
| LG secondary | 4 columns | 3 columns |
| 2XL secondary | 4 stacked rows | 3 stacked rows |

---

## Component Architecture

### SectionType3 (Main Component)
- Renders the full section with category label, featured article, and secondary articles
- Has `id={slug}` for anchor navigation from header
- Uses `scroll-mt-24` to account for sticky header when scrolling
- Section-level bottom border (`border-b border-gray-300`) for consistent separation

### FeaturedMedia (Shared Component)
- Located at `packages/ui/sections/components/FeaturedMedia.tsx`
- Accepts `images` prop (string or string array) and `alt` text
- Renders single image when given a string or single-item array
- Renders gallery carousel when given array with 2+ images
- Image displayed at 3:2 aspect ratio

### SecondaryArticleCard (Internal Component)
- Simple card displaying title and time
- Consistent `py-3` vertical padding
- Title: `font-semibold text-base leading-tight`
- Time: `text-sm text-gray-500`

---

## Responsive Behavior

### Tailwind Breakpoints
| Breakpoint | Min Width | Description |
|------------|-----------|-------------|
| SM (base)  | 0px       | Mobile - primary focus |
| MD         | 768px     | Tablet |
| LG         | 1024px    | Desktop |
| 2XL        | 1536px    | Large desktop |

### Featured Title Font Sizes
| Breakpoint | Class/Style | Size |
|------------|-------------|------|
| SM | `text-2xl` | 1.5rem (24px) |
| MD | `md:text-3xl` | 1.875rem (30px) |
| LG+ | Dynamic (see below) | 1.5rem - 3rem |

### Dynamic Title Sizing (LG+ breakpoints)

At LG and above, the title and image are displayed side-by-side. To prevent the text content from overflowing the image height, the component dynamically adjusts the title font size.

**How it works:**
1. Measures the image height (which is determined by its 3:2 aspect ratio)
2. Iterates through font sizes from largest to smallest: 3rem → 2.25rem → 1.875rem → 1.5rem
3. Selects the largest size where text content fits within the image height
4. Recalculates on window resize and image size changes

**Implementation:**
- Uses `useLayoutEffect` for measurements before paint
- `ResizeObserver` monitors image size changes
- Window resize listener handles breakpoint transitions
- Falls back to Tailwind classes below LG breakpoint (1024px)

---

## Breakpoint Layouts

### SM (<768px)

```
┌─────────────────────────────────────────────────────────────────┐
│ Section Label                                                   │
│ Featured Title                                                  │
│ Snippet                                                         │
│ Time                                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                        Image                                │ │
│ │                     (aspect 3:2)                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Art 1 Title                                                     │
│ Time                                                            │
├─────────────────────────────────────────────────────────────────┤
│ Art 2 Title                                                     │
│ Time                                                            │
├─────────────────────────────────────────────────────────────────┤
│ Art 3 Title                                                     │
│ Time                                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Layout Details:**
- Everything stacked vertically, full width
- Image bleeds to full viewport (`-mx-6`)
- Secondary articles: 3 rows, all full width
- All articles have bottom border except the last one

**Borders:**
- Top border on secondary container (`border-t`)
- Bottom border between articles 1-2 and 2-3 (`border-b`)
- Section-level bottom border

---

### MD (≥768px)

```
┌─────────────────────────────────────────────────────────────────┐
│ Section Label                                                   │
│ Featured Title                                                  │
│ Snippet                                                         │
│ Time                                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                        Image                                │ │
│ │                     (aspect 3:2)                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────┬─────────────────────┬─────────────────────┤
│ Art 1 Title         │ Art 2 Title         │ Art 3 Title         │
│ Time                │ Time                │ Time                │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**Layout Details:**
- Everything stacked vertically, full width
- Image bleeds to full viewport (`-mx-6`)
- Secondary articles: 1 row, 3 equal columns (`md:grid-cols-3`)
- Column padding: `md:pr-4`, `md:px-4`, `md:pl-4`

**Borders:**
- No top border (`md:border-t-0`)
- No vertical borders between columns
- No bottom borders on articles (`md:border-b-0`)
- Section-level bottom border

---

### LG (≥1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│ Section Label                                                   │
├───────────────────┬─────────────────────────────────────────────┤
│ Featured Title    │                                             │
│ (dynamic size)    │                                             │
│                   │              Image (2/3)                    │
│ Snippet           │             (aspect 3:2)                    │
│ Time              │                                             │
│      (1/3)        │                                             │
├───────────────────┴──────────────────┬──────────────────────────┤
│ Art 1 Title       │ Art 2 Title      │ Art 3 Title              │
│ Time              │ Time             │ Time                     │
└───────────────────┴──────────────────┴──────────────────────────┘
```

**Layout Details:**
- Featured article: Flex row (`lg:flex lg:gap-8`)
  - Text content: 1/3 width (`lg:w-1/3`)
  - Image: 2/3 width (`lg:w-2/3`)
- Image contained within column (`lg:mx-0`)
- Secondary articles: 3 equal columns (`lg:grid-cols-3`)
- Column padding for spacing between articles

**Borders:**
- No top border on container (`md:border-t-0`)
- No bottom borders on secondary articles (`lg:border-b-0`)
- Section-level bottom border

---

### 2XL (≥1536px)

```
┌─────────────────────────────────────────────────────────────────┐
│ Section Label                                                   │
├──────────────┬─────────────────────────────────┬────────────────┤
│ Featured     │                                 │ Art 1 Title    │
│ Title        │                                 │ Time           │
│ (dynamic)    │         Image (2/4)             ├────────────────┤
│              │        (aspect 3:2)             │ Art 2 Title    │
│ Snippet      │                                 │ Time           │
│ Time         │                                 ├────────────────┤
│              │                                 │ Art 3 Title    │
│    (1/4)     │                                 │ Time           │
└──────────────┴─────────────────────────────────┴────────────────┘
```

**Layout Details:**
- Main wrapper: 4-column grid (`2xl:grid 2xl:grid-cols-4 2xl:gap-8`)
- Featured article uses `display: contents` so children become direct grid items
  - Text content: 1 column (auto)
  - Image: 2 columns (`2xl:col-span-2`)
- Secondary articles: 1 column, stacked vertically (`2xl:block`)
- All in a single row

**Borders:**
- No top border on secondary container (`2xl:border-t-0`)
- Bottom borders between stacked secondary articles (`2xl:border-b`)
- Section-level bottom border

---

## Usage Example

SectionType3 is not used directly — it's rendered by `CategorySectionWrapper` based on the `sectionType` prop. See [CategorySectionWrapper.md](CategorySectionWrapper.md).

```tsx
// apps/*/app/page.tsx
import { CategorySectionWrapper } from "@umg/ui";

<CategorySectionWrapper
  slug="economy-business"
  category="Economy & Business"
  sectionType="type3"
/>
```

---

## Dummy Data

```json
{
  "featured": {
    "title": "Central banks signal coordinated approach to interest rate policy",
    "snippet": "Major central banks around the world are signaling a more coordinated approach to monetary policy as global inflation concerns persist and economic growth forecasts remain uncertain.",
    "time": "6 min read",
    "gallery": "https://picsum.photos/seed/type3feat/900/600",
    "url": "#"
  },
  "secondary": [
    {
      "title": "Stock markets rally on positive earnings reports from tech sector",
      "time": "3 min read",
      "url": "#"
    },
    {
      "title": "Supply chain disruptions continue to impact manufacturing globally",
      "time": "4 min read",
      "url": "#"
    },
    {
      "title": "Emerging markets show resilience despite currency volatility",
      "time": "5 min read",
      "url": "#"
    }
  ]
}
```

---

## Reference Images

Reference images are located in `claude-context/sections/`:
- `section-type-3-2XL+.png` (if available)
- `section-type-3-LG+.png` (if available)
- `section-type-3-MD+.png` (if available)
- `section-type-3-SM+.png` (if available)
