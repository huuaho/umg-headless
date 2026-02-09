# Section Type 4

> **Development Approach**: Mobile-first. The mobile version is the primary focus of this website. Base styles target SM, then progressively enhance for MD and LG.

A simpler news section featuring 4 equal-weight articles with two variants: with images or text-only. Unlike Section Types 1-3, this section has no featured/secondary distinction and only uses 3 breakpoints (no 2XL).

---

## File Structure

| File | Description |
|------|-------------|
| `packages/ui/sections/SectionType4.tsx` | Main component with ArticleCard sub-component |
| `packages/api/types.ts` | TypeScript interfaces (`Type4Article`, `SectionType4Data`) |

---

## TypeScript Interfaces

```typescript
// packages/api/types.ts

export interface Type4Article {
  title: string;
  time: string;
  image?: string; // Optional - only used when textOnly is false
  url: string;
  slug?: string;  // Present for internal articles (EM/IS), absent for external (UMG)
}

export interface SectionType4Data {
  articles: Type4Article[];
}

// Component props
interface SectionType4Props extends SectionType4Data {
  slug: string;
  category: string;
  textOnly?: boolean; // Default: false (show images)
}
```

All article links use `ArticleLink` — renders `<Link>` for internal articles (slug present) or `<a target="_blank">` for external (slug absent). See [../components/ArticleLink.md](../components/ArticleLink.md).

---

## Content Structure

### Articles (x4)
- **Title**: Headline
- **Time**: Reading time (e.g., "4 min read")
- **Image**: Optional, only displayed when `textOnly={false}` (aspect ratio 3:2)

---

## Variants

| Variant | Prop | Description |
|---------|------|-------------|
| With Images | `textOnly={false}` (default) | Articles display with images |
| Text Only | `textOnly={true}` | Articles display without images |

---

## Component Architecture

### SectionType4 (Main Component)
- Renders the full section with category label and 4 articles
- Has `id={slug}` for anchor navigation from header
- Uses `scroll-mt-24` to account for sticky header when scrolling
- Section-level bottom border (`border-b border-gray-300`) for consistent separation
- Accepts `textOnly` prop to toggle between variants

### ArticleCard (Internal Component)
- Wrapper div handles column padding (so borders don't extend into padding)
- Inner article handles content layout and borders
- Uses `md:h-full` on both wrapper and article to ensure equal row heights at MD+
- With images: Flex layout switches from row (SM/MD) to column (LG)
- Text only: Simple stacked title and time

---

## Responsive Behavior

### Tailwind Breakpoints
| Breakpoint | Min Width | Description |
|------------|-----------|-------------|
| SM (base)  | 0px       | Mobile - primary focus |
| MD         | 768px     | Tablet |
| LG         | 1024px    | Desktop |

**Note:** Section Type 4 does not have a 2XL-specific layout.

---

## Breakpoint Layouts

### SM (<768px)

**With Images (textOnly: false):**
```
┌─────────────────────────────────────────────────────────────────┐
│ Section Label                                                   │
├─────────────────────────────────────────┬───────────────────────┤
│ Title                                   │       Image           │
│ Time                     (2/3)          │       (1/3)           │
├─────────────────────────────────────────┼───────────────────────┤
│ Title                                   │       Image           │
│ Time                     (2/3)          │       (1/3)           │
├─────────────────────────────────────────┼───────────────────────┤
│ Title                                   │       Image           │
│ Time                     (2/3)          │       (1/3)           │
├─────────────────────────────────────────┼───────────────────────┤
│ Title                                   │       Image           │
│ Time                     (2/3)          │       (1/3)           │
└─────────────────────────────────────────┴───────────────────────┘
```

**Text Only (textOnly: true):**
```
┌─────────────────────────────────────────────────────────────────┐
│ Section Label                                                   │
├─────────────────────────────────────────────────────────────────┤
│ Title                                                           │
│ Time                                                            │
├─────────────────────────────────────────────────────────────────┤
│ Title                                                           │
│ Time                                                            │
├─────────────────────────────────────────────────────────────────┤
│ Title                                                           │
│ Time                                                            │
├─────────────────────────────────────────────────────────────────┤
│ Title                                                           │
│ Time                                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Layout Details:**
- 4 stacked rows
- With images: Text takes 2/3 width (left), Image takes 1/3 width (right)
- Image aspect ratio 3:2

**Borders:**
- Bottom border on articles 1, 2, 3
- No border on article 4 (section border serves as bottom)

---

### MD (≥768px)

**With Images (textOnly: false):**
```
┌───────────────────────────────┬───────────────────────────────┐
│ Title              │  Image   │ Title              │  Image   │
│ Time      (2/3)    │  (1/3)   │ Time      (2/3)    │  (1/3)   │
├───────────────────────────────┼───────────────────────────────┤
│ Title              │  Image   │ Title              │  Image   │
│ Time      (2/3)    │  (1/3)   │ Time      (2/3)    │  (1/3)   │
└───────────────────────────────┴───────────────────────────────┘
```

**Text Only (textOnly: true):**
```
┌───────────────────────────────┬───────────────────────────────┐
│ Title                         │ Title                         │
│ Time                          │ Time                          │
├───────────────────────────────┼───────────────────────────────┤
│ Title                         │ Title                         │
│ Time                          │ Time                          │
└───────────────────────────────┴───────────────────────────────┘
```

**Layout Details:**
- 2x2 grid (`md:grid-cols-2`)
- With images: Within each cell, text 2/3 left, image 1/3 right
- Equal row heights via `md:h-full` on wrapper and article
- Column padding: left column `md:pr-4`, right column `md:pl-4`

**Borders:**
- Top row: Each cell has its own bottom border (with gap showing padding)
- Bottom row: No individual borders (section border serves as bottom)

---

### LG (≥1024px)

**With Images (textOnly: false):**
```
┌─────────────────────────────────────────────────────────────────┐
│ Section Label                                                   │
├───────────────┬───────────────┬───────────────┬─────────────────┤
│    Image      │    Image      │    Image      │    Image        │
│  (aspect 3:2) │  (aspect 3:2) │  (aspect 3:2) │  (aspect 3:2)   │
├───────────────┼───────────────┼───────────────┼─────────────────┤
│ Title         │ Title         │ Title         │ Title           │
│ Time          │ Time          │ Time          │ Time            │
└───────────────┴───────────────┴───────────────┴─────────────────┘
```

**Text Only (textOnly: true):**
```
┌─────────────────────────────────────────────────────────────────┐
│ Section Label                                                   │
├───────────────┬───────────────┬───────────────┬─────────────────┤
│ Title         │ Title         │ Title         │ Title           │
│ Time          │ Time          │ Time          │ Time            │
└───────────────┴───────────────┴───────────────┴─────────────────┘
```

**Layout Details:**
- 4 equal columns (`lg:grid-cols-4`)
- With images: Image on TOP, text below (flex-col layout)
- Uses CSS order to flip image/text positions from SM/MD
- Column padding for spacing between articles

**Borders:**
- No individual article borders (`lg:border-b-0`)
- Section-level bottom border only

---

## Usage Example

SectionType4 is not used directly — it's rendered by `CategorySectionWrapper` based on the `sectionType` prop. See [CategorySectionWrapper.md](CategorySectionWrapper.md).

```tsx
// apps/*/app/page.tsx
import { CategorySectionWrapper } from "@umg/ui";

// With images
<CategorySectionWrapper
  slug="diplomacy"
  category="Diplomacy"
  sectionType="type4"
/>

// Text only
<CategorySectionWrapper
  slug="art-culture"
  category="Art & Culture"
  sectionType="type4-text"
/>
```

---

## Dummy Data

**With Images:**
```json
{
  "articles": [
    {
      "title": "Catherine O'Hara, star of 'Schitt's Creek' and 'Home Alone,' dead at 71",
      "time": "4 min read",
      "image": "https://picsum.photos/seed/type4a1/900/600",
      "url": "#"
    },
    {
      "title": "Baby long-necked dinosaurs were a 'perfect snack' for predators",
      "time": "3 min read",
      "image": "https://picsum.photos/seed/type4a2/900/600",
      "url": "#"
    },
    {
      "title": "Survival showdown in 'Send Help' is full of firsts for star Rachel McAdams",
      "time": "5 min read",
      "image": "https://picsum.photos/seed/type4a3/900/600",
      "url": "#"
    },
    {
      "title": "Galaxy cluster observed forming surprisingly early in universe's history",
      "time": "6 min read",
      "image": "https://picsum.photos/seed/type4a4/900/600",
      "url": "#"
    }
  ]
}
```

**Text Only:**
```json
{
  "articles": [
    {
      "title": "Bitcoin falls below $80,000, continuing decline as liquidity worries mount",
      "time": "3 min read",
      "url": "#"
    },
    {
      "title": "Japan's Takaichi cites weak yen's benefits even as her government threatens intervention",
      "time": "4 min read",
      "url": "#"
    },
    {
      "title": "Wall St Week Ahead Heavy earnings week, jobs data to test US stocks after Microsoft swoon",
      "time": "5 min read",
      "url": "#"
    },
    {
      "title": "Boeing reaches labor deal with former Spirit AeroSystems white-collar workers",
      "time": "2 min read",
      "url": "#"
    }
  ]
}
```

---

## Reference Images

Reference images are located in `claude-context/sections/`:
- `section-type-4a-SM+.png` (with images, mobile)
- `section-type-4a-MD+.png` (with images, tablet)
- `section-type-4a-LG+.png` (with images, desktop)
- `section-type-4b-SM+.png` (text only, mobile)
- `section-type-4b-MD+.png` (text only, tablet)
- `section-type-4b-LG+.png` (text only, desktop)
