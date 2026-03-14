# Judges Panel

## Overview

The judges panel is a dedicated page (`/judges-panel`) displaying bios and headshots for competition judges. Judges are also referenced on the how-to-enter page as clickable cards that deep-link to the panel.

## Data

**File**: `apps/umg/lib/competitions/judges.tsx`

Exports:
- `Judge` type — `{ id, name, title, bio, image }`
- `judges` array — 14 Judge objects

### Judge Type

```typescript
type Judge = {
  id: string;        // Kebab-case ID, used as anchor (e.g. "antoine-denis")
  name: string;      // Full name
  title: string;     // Professional title
  bio: ReactNode;    // Can be JSX (for italics, etc.) or plain string
  image: string;     // Path to headshot in public/images/judges/
};
```

### Current Judges (2026)

| ID | Name | Title |
|----|------|-------|
| `antoine-denis` | Denis Antoine | Former Ambassador of Grenada |
| `austin-amy` | Amy Austin | President & CEO, Theatre Washington |
| `bain-raymone` | Raymone Bain | PR & Crisis Management Expert |
| `chanault-nell` | Nell Chanault | Community Leader |
| `djoken-guy` | Guy Djoken | Executive Director of the UNESCO Center for Peace |
| `du-plain-jan` | Jan Du Plain | Author & Commentator |
| `herd-stan` | Stan Herd | Crop Artist |
| `ishii-lisa` | Lisa Ishii | SVP Operations, Johns Hopkins |
| `lawson-madeline` | Madeline Lawson | Education Advocate |
| `lierman-terry` | Terry Lierman | Former Chief of Staff to House Majority Leader & Senate Appropriations Staff Director |
| `mcphatter-renee` | Renee McPhatter | Community Organizer |
| `qiu-philip` | Philip Qiu | Photographer |
| `rutledge-derrick` | Derrick Rutledge | Celebrity Makeup Artist |
| `whatley-annie` | Annie Whatley | Arts Educator |

### Judge Images

Stored in `apps/umg/public/images/judges/` as PNG or JPG files, named by kebab-case judge ID:

```
public/images/judges/
├── antoine-denis.png
├── austin-amy.png
├── bain-raymone.jpg
├── djoken-guy.png
├── du-plain-jan.png
├── herd-stan.png
├── ishii-lisa.png
├── lawson-madeline.png
├── lierman-terry.png
├── mcphatter-renee.png
├── qiu-philip.jpg
├── rutledge-derrick.png
└── whatley-annie.png
```

Note: `chanault-nell.png` was removed. The judge entry still exists in the data but has no image file.

## Pages

### Judges Panel Page

**File**: `apps/umg/app/judges-panel/page.tsx`

- Server component
- Hero banner with competition-branded gradient
- 3-column responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Each card has `id={judge.id}` for anchor linking
- Cards include: image, name, title, bio text

### HashScroller

**File**: `apps/umg/app/judges-panel/HashScroller.tsx`

Client component that handles URL hash anchors on page load:
- On mount, checks `window.location.hash`
- Waits 100ms for DOM hydration
- Smooth-scrolls to the target element
- Cards have `scroll-margin-top` to account for sticky header

### How-to-Enter Integration

The how-to-enter page includes a "Meet the Judges" section with clickable judge cards that link to `/judges-panel#{judge.id}`. Clicking a judge card navigates to the panel and auto-scrolls to their bio.

## Adding/Updating Judges

1. Add the judge's headshot to `public/images/judges/{id}.png`
2. Add a new entry to the `judges` array in `lib/competitions/judges.tsx`
3. Both pages (judges-panel and how-to-enter) update automatically
