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
| `denis-antoine` | Denis Antoine | Former Ambassador of Grenada to the U.S. & United Nations |
| `amy-austin` | Amy Austin | President & CEO, Theatre Washington |
| `raymone-bain` | Raymone Bain | PR & Crisis Management Expert |
| `nell-chennault` | Nell Chennault | President & CEO, Chennault Aviation & Military Museum |
| `guy-djoken` | Guy Djoken | Executive Director of the UNESCO Center for Peace |
| `jan-du-plain` | Jan Du Plain | CEO & President, Du Plain Global Enterprises |
| `stan-herd` | Stan Herd | Crop Artist & Painter |
| `lisa-ishii` | Lisa Ishii | SVP Operations, Johns Hopkins Health System |
| `madeline-lawson` | Madeline Lawson | Founder & CEO, Institute for Multicultural Minority Medicine |
| `terry-lierman` | Terry Lierman | Former Chief of Staff to House Majority Leader & Senate Appropriations Staff Director |
| `renee-mcphatter` | Renee McPhatter | AVP Government & Community Relations, George Washington University |
| `philip-qiu` | Philip Qiu | Founder & Chairman, Chinese American Museum DC |
| `derrick-rutledge` | Derrick Rutledge | Celebrity Stylist & Makeup Artist |
| `annie-whatley` | Annie Whatley | AVP External Relations, University of the District of Columbia |

### Judge Images

Stored in `apps/umg/public/images/judges/` as PNG files. Note: image filenames use `lastname-firstname.png` format, while judge IDs use `firstname-lastname` format.

```
public/images/judges/
├── antoine-denis.png
├── austin-amy.png
├── bain-raymone.png
├── chennault-nell.png
├── djoken-guy.png
├── du-plain-jan.png
├── herd-stan.png
├── ishii-lisa.png
├── lawson-madeline.png
├── lierman-terry.png
├── mcphatter-renee.png
├── qiu-philip.png
├── rutledge-derrick.png
└── whatley-annie.png
```

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
