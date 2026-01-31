# Section Type 1

> **Development Approach**: Mobile-first. The mobile version is the primary focus of this website. Base styles target SM, then progressively enhance for MD, LG, and 2XL.

A news section featuring 5 articles: 1 featured (main) article and 4 secondary articles.

---

## File Structure

| File | Description |
|------|-------------|
| `components/sections/SectionType1.tsx` | Main component with Gallery and SecondaryArticleCard sub-components |
| `lib/dummyData.ts` | TypeScript interfaces and mock data |

---

## TypeScript Interfaces

```typescript
// lib/dummyData.ts

export interface FeaturedArticle {
  title: string;
  snippet: string;
  time: string;
  gallery: string[];
}

export interface SecondaryArticle {
  title: string;
  time: string;
}

export interface SectionType1Data {
  category: string; // Category name displayed as section label
  featured: FeaturedArticle;
  secondary: SecondaryArticle[];
}

// Component props extend the data interface with a slug for anchor navigation
interface SectionType1Props extends SectionType1Data {
  slug: string;
}
```

---

## Content Structure

### Featured Article
- **Category**: Category name displayed as section label (e.g., "United States >")
- **Title**: Large headline (responsive sizing: 2xl → 3xl → 4xl → 5xl)
- **Snippet**: Brief excerpt from the article
- **Time**: Reading time (e.g., "7 min read")
- **Gallery**: Image carousel with navigation arrows (aspect ratio 3:2)

### Secondary Articles (x4)
- **Title**: Headline only
- **Time**: Reading time (e.g., "X min read")

---

## Component Architecture

### SectionType1 (Main Component)
- Renders the full section with category label, featured article, and secondary articles
- Has `id={slug}` for anchor navigation from header
- Uses `scroll-mt-24` to account for sticky header when scrolling

### Gallery (Internal Component)
- Client component using `useState` for image index tracking
- Displays images at 3:2 aspect ratio using Next.js `Image` with `fill` and `object-cover`
- Navigation: Previous/Next arrow buttons with wrap-around behavior
- Pagination tracker shows `[currentIndex/total]` format
- Bottom bar layout: pagination left, arrows right
- On SM/MD: Gallery bleeds to full viewport width (`-mx-4`), controls have `px-4` padding
- On LG+: Gallery constrained to container (`lg:mx-0`), controls have no padding (`lg:px-0`)

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
| Breakpoint | Class | Size |
|------------|-------|------|
| SM | `text-2xl` | 1.5rem (24px) |
| MD | `md:text-3xl` | 1.875rem (30px) |
| LG | `lg:text-4xl` | 2.25rem (36px) |
| 2XL | `2xl:text-5xl` | 3rem (48px) |

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
│ │                        Gallery                              │ │
│ │                       [< img >]                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Art 1 Title                                                     │
│ Time                                                            │
├─────────────────────────────────────────────────────────────────┤
│ Art 2 Title                                                     │
│ Time                                                            │
├────────────────────────────────┬────────────────────────────────┤
│ Art 3 Title                    │ Art 4 Title                    │
│ Time                           │ Time                           │
└────────────────────────────────┴────────────────────────────────┘
```

**Layout Details:**
- Everything stacked vertically, full width
- Gallery bleeds to full viewport (`-mx-4`)
- Secondary articles: 3 rows
  - Row 1: Article 1 (full width, `col-span-2`)
  - Row 2: Article 2 (full width, `col-span-2`)
  - Row 3: Articles 3 & 4 (2 equal columns, `col-span-1` each)
- Articles 3 & 4 have inner padding (`pr-2`, `pl-2`)

**Borders:**
- Top border on secondary container (`border-t`)
- Bottom border between articles 1-2, 2-3/4 (`border-b`)
- Bottom border on container (`border-b`)
- No vertical border between articles 3 and 4

---

### MD (≥768px)

```
┌─────────────────────────────────────────────────────────────────┐
│ Section Label                                                   │
│ Featured Title                                                  │
│ Snippet                                                         │
│ Time                                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                        Gallery                              │ │
│ │                       [< img >]                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
├────────────────────────────────┬────────────────────────────────┤
│ Art 1 Title                    │ Art 2 Title                    │
│ Time                           │ Time                           │
├────────────────────────────────┼────────────────────────────────┤
│ Art 3 Title                    │ Art 4 Title                    │
│ Time                           │ Time                           │
└────────────────────────────────┴────────────────────────────────┘
```

**Layout Details:**
- Everything stacked vertically, full width
- Gallery bleeds to full viewport (`-mx-4`)
- Secondary articles: 2x2 grid
  - All articles are `md:col-span-1`
  - Column padding: left column `md:pr-4`, right column `md:pl-4`

**Borders:**
- No top border (`md:border-t-0`)
- No vertical borders between columns
- Horizontal border between rows 1-2 and 2-bottom (`border-b`)
- Bottom border on container

---

### LG (≥1024px)

```
┌──────────────────────────────────────────┬──────────────────────┐
│ Section Label                            │ Art 1 Title          │
│ Featured Title (large)                   │ Time                 │
│ Snippet                                  ├──────────────────────┤
│ Time                                     │ Art 2 Title          │
│                                          │ Time                 │
│ ┌──────────────────────────────────────┐ ├──────────────────────┤
│ │                                      │ │ Art 3 Title          │
│ │            Gallery                   │ │ Time                 │
│ │           [< img >]                  │ ├──────────────────────┤
│ └──────────────────────────────────────┘ │ Art 4 Title          │
│                                          │ Time                 │
└──────────────────────────────────────────┴──────────────────────┘
```

**Layout Details:**
- Main wrapper: `lg:flex lg:gap-8`
- Width ratio: 2/3 featured (`lg:w-2/3`) | 1/3 secondary (`lg:w-1/3`)
- Featured article: Vertically stacked (label → title → snippet → time → gallery)
- Gallery contained within column (`lg:mx-0`)
- Secondary articles: Stacked vertically (`lg:grid-cols-1`)

**Borders:**
- No top border on container (`lg:border-t-0`)
- No bottom border on container (`lg:border-b-0`)
- Horizontal dividers between all secondary articles (`lg:border-b`)

---

### 2XL (≥1536px)

```
┌─────────────────────────────────────────────────────────────────┐
│ Section Label (small)                                           │
├───────────────────┬─────────────────────────────────────────────┤
│ Featured Title    │                                             │
│ (very large)      │                                             │
│                   │              Gallery (2/3)                  │
│ Snippet           │             [< img >]                       │
│ Time              │              aspect 3:2                     │
│      (1/3)        │                                             │
├────────┬──────────┴────────┬────────────────┬───────────────────┤
│ Art 1  │ Art 2             │ Art 3          │ Art 4             │
│ Title  │ Title             │ Title          │ Title             │
│ Time   │ Time              │ Time           │ Time              │
└────────┴───────────────────┴────────────────┴───────────────────┘
```

**Layout Details:**
- Main wrapper reverts to block (`2xl:block`)
- Featured article: Flex row (`2xl:flex 2xl:gap-8`)
  - Text content: 1/3 width (`2xl:w-1/3`)
  - Gallery: 2/3 width (`2xl:w-2/3`)
- Secondary articles: 4 equal columns (`2xl:grid-cols-4`)
- All secondary articles `2xl:col-span-1`
- Column padding for spacing between articles

**Borders:**
- No top border (`2xl:border-t-0`)
- No vertical borders between secondary articles
- Bottom border on secondary container (`2xl:border-b`)
- No bottom borders on individual articles (`2xl:border-b-0`)

---

## Usage Example

```tsx
// app/page.tsx
import SectionType1 from "@/components/sections/SectionType1";
import { sectionType1Data } from "@/lib/dummyData";

<SectionType1
  slug="world-news-politics"
  category="World News & Politics"
  featured={sectionType1Data.featured}
  secondary={sectionType1Data.secondary}
/>
```

---

## Dummy Data

```json
{
  "category": "United States",
  "featured": {
    "title": "Thousands demonstrate in Minnesota and across US to protest ICE",
    "snippet": "Thousands of protesters took to the streets in Minneapolis and students across the United States staged walkouts on Friday to demand the withdrawal of federal immigration agents from Minnesota following the fatal shootings of two U.S. citizens.",
    "time": "7 min read",
    "gallery": [
      "https://picsum.photos/seed/news1/900/600",
      "https://picsum.photos/seed/news2/900/600",
      "https://picsum.photos/seed/news3/900/600"
    ]
  },
  "secondary": [
    {
      "title": "US Justice Dept opens civil rights probe into Alex Pretti shooting, official says",
      "time": "4 min read"
    },
    {
      "title": "Ex-CNN journalist Don Lemon arrested after anti-ICE church protest in Minnesota",
      "time": "3 min read"
    },
    {
      "title": "New York governor proposes bill to ban local law enforcement from being deputized by ICE",
      "time": "5 min read"
    },
    {
      "title": "Lawsuit challenges ICE ability to enter homes without warrants from US judges",
      "time": "6 min read"
    }
  ]
}
```

---

## Reference Images

Reference images are located in `claude-context/sections/`:
- `section-type-1-2XL+.png`
- `section-type-1-LG+.png`
- `section-type-1-MD+.png`
- `section-type-1-SM+.png`
