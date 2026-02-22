# Section Type 2

> **Development Approach**: Mobile-first. The mobile version is the primary focus of this website. Base styles target SM, then progressively enhance for MD, LG, and 2XL.

A news section featuring 5 articles: 1 featured (main) article with a single image and 4 secondary articles. Similar to Section Type 1 but with a single image instead of a gallery carousel.

---

## File Structure

| File | Description |
|------|-------------|
| `packages/ui/sections/SectionType2.tsx` | Main component with SecondaryArticleCard sub-component |
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
interface SectionType2Props extends SectionData {
  slug: string;
  category: string;
  categoryColor?: string;          // Hex color for category label, defaults to black
  categoryTextColor?: string;      // Independent text color for category label
  categoryUnderlineColor?: string; // Colored underline below category label
  categoryIcon?: string;           // Icon URL to the left of category label
  titleClassName?: string;         // Custom CSS class for the featured headline
}
```

All article links use `ArticleLink` — renders `<Link>` for internal articles (slug present) or `<a target="_blank">` for external (slug absent). See [../components/ArticleLink.md](../components/ArticleLink.md).

---

## Content Structure

### Featured Article
- **Category**: Category name displayed as section label (e.g., "Profiles & Opinions >")
- **Title**: Large headline (responsive sizing with dynamic adjustment at LG+)
- **Snippet**: Brief excerpt from the article
- **Time**: Reading time (e.g., "8 min read")
- **Image**: Single image via FeaturedMedia component (aspect ratio 3:2)

### Secondary Articles (x4)
- **Title**: Headline only
- **Time**: Reading time (e.g., "X min read")

---

## Key Differences from Section Type 1

| Feature | Section Type 1 | Section Type 2 |
|---------|---------------|----------------|
| Featured media | Gallery carousel (array) | Single image (string) |
| LG layout | 2/3 featured + 1/3 secondary side-by-side | 1/3 text + 2/3 image, secondary 4-col below |
| 2XL layout | Text + gallery side-by-side, secondary 4-col below | 4-col grid (1 text, 2 image, 1 secondary stack) |
| Dynamic title sizing | At 2XL only | At LG+ (1024px) |
| SM secondary articles | 3 rows (1, 1, 2 cols) | 4 rows (all full width) |

---

## Component Architecture

### CategoryLabel (Shared Component)
- Located at `packages/ui/sections/CategoryLabel.tsx`
- Renders the category name with optional icon, text color, and underline
- See [../components/CategoryLabel.md](../components/CategoryLabel.md)

### SectionType2 (Main Component)
- Renders the full section using `CategoryLabel` for the category header, featured article, and secondary articles
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
├─────────────────────────────────────────────────────────────────┤
│ Art 4 Title                                                     │
│ Time                                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Layout Details:**
- Everything stacked vertically, full width
- Image bleeds to full viewport (`-mx-6`)
- Secondary articles: 4 rows, all full width
- All articles have bottom border except the last one

**Borders:**
- Top border on secondary container (`border-t`)
- Bottom border between all articles (`border-b`)
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
- Image bleeds to full viewport (`-mx-6`)
- Secondary articles: 2x2 grid (`md:grid-cols-2`)
- Column padding: left column `md:pr-4`, right column `md:pl-4`

**Borders:**
- No top border (`md:border-t-0`)
- No vertical borders between columns
- Horizontal border between rows 1-2 (`border-b`)
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
├────────┬──────────┴────────┬────────────────┬───────────────────┤
│ Art 1  │ Art 2             │ Art 3          │ Art 4             │
│ Title  │ Title             │ Title          │ Title             │
│ Time   │ Time              │ Time           │ Time              │
└────────┴───────────────────┴────────────────┴───────────────────┘
```

**Layout Details:**
- Featured article: Flex row (`lg:flex lg:gap-8`)
  - Text content: 1/3 width (`lg:w-1/3`)
  - Image: 2/3 width (`lg:w-2/3`)
- Image contained within column (`lg:mx-0`)
- Secondary articles: 4 equal columns (`lg:grid-cols-4`)
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
│              │                                 ├────────────────┤
│              │                                 │ Art 4 Title    │
│              │                                 │ Time           │
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

SectionType2 is not used directly — it's rendered by `CategorySectionWrapper` based on the `sectionType` prop. See [CategorySectionWrapper.md](CategorySectionWrapper.md).

```tsx
// apps/*/app/page.tsx
import { CategorySectionWrapper } from "@umg/ui";

<CategorySectionWrapper
  slug="profiles-opinions"
  category="Profiles & Opinions"
  sectionType="type2"
/>
```

---

## Dummy Data

```json
{
  "featured": {
    "title": "Global leaders gather for historic climate summit in Geneva",
    "snippet": "World leaders from over 150 countries have convened in Geneva for what is being called the most significant climate conference since the Paris Agreement, with ambitious new targets expected to be announced.",
    "time": "8 min read",
    "gallery": "https://picsum.photos/seed/type2feat/900/600",
    "url": "#"
  },
  "secondary": [
    {
      "title": "UN Secretary-General calls for immediate action on carbon emissions",
      "time": "4 min read",
      "url": "#"
    },
    {
      "title": "Small island nations demand stronger commitments from industrialized countries",
      "time": "5 min read",
      "url": "#"
    },
    {
      "title": "Tech giants pledge billions toward renewable energy initiatives",
      "time": "3 min read",
      "url": "#"
    },
    {
      "title": "Youth activists stage peaceful demonstration outside conference venue",
      "time": "2 min read",
      "url": "#"
    }
  ]
}
```

---

## Reference Images

Reference images are located in `claude-context/sections/`:
- `section-type-2-2XL+.png` (if available)
- `section-type-2-LG+.png` (if available)
- `section-type-2-MD+.png` (if available)
- `section-type-2-SM+.png` (if available)
