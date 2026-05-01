# About Us Page (UMG)

## Overview

The About Us page introduces United Media Group, its platforms, values, partners, and the My Hometown, My Lens photography competition. Currently staged at `/about-us-new` while the original `/about-us` remains live.

**Route**: `/about-us-new` (staging) — will replace `/about-us` when finalized
**File**: `apps/umg/app/about-us-new/page.tsx`

## Sections

### 1. Hero Banner
- Full-width dark gradient background (`from-[#1a1a2e] to-[#16213e]`)
- H1: "Diplomacy. Culture. Community."
- Subtitle: "Washington, D.C.'s Multicultural Media Voice"
- Placeholder gradient — hero photo TBD

### 2. Who We Are
- Section heading in blue (`#3b5fe5`)
- Left border accent in matching blue (`border-l-4`)
- Two paragraphs describing UMG's mission

### 3. Our Platforms
- Three-column card grid (`md:grid-cols-3`)
- Each card: platform name, tagline (uppercase), description
- Platform colors defined as CSS variables in `globals.css`:

| Platform | Name Color | Tagline Color |
|----------|-----------|---------------|
| Diplomatic Watch | `--color-dw` (#1a3578) | `--color-dw-tagline` (#2e5cb8) |
| Echo Media | `--color-em` (#2d6a2e) | `--color-em-tagline` (#4a8c3f) |
| International Spectrum | `--color-is` (#8b4513) | `--color-is-tagline` (#c0542b) |

### 4. My Hometown, My Lens
- Section heading + bordered callout card (`border-3 border-[#3b5fe5]`)
- Competition description with bold highlights (Library of Congress, Smithsonian, $8,000)
- "Enter the Competition →" links to `/how-to-enter`

### 5. What Drives Us
- 2x2 grid of values: Community First, Amplify Don't Extract, Bridge Cultures, Invest in Youth

### 6. Our Partners
- Reuses the `HostingCommittees` component with custom props:
  ```tsx
  <HostingCommittees
    title="Our Partners"
    titleClassName="text-2xl md:text-3xl font-bold text-center text-[#3b5fe5] mb-4"
    subtitle="We collaborate with organizations that share our commitment to cultural exchange, education, and community storytelling."
  />
  ```
- Same partner logos/data as the competition how-to-enter page

### 7. Connect With Us
- Dark background (`bg-[#212223]`)
- Contact info: Email, Instagram, X/Twitter, Location

## Section Heading Style

All section headings (except Connect With Us which is white-on-dark) use the blue accent color `#3b5fe5`.

## Dependencies

| Component | File |
|-----------|------|
| `HostingCommittees` | `apps/umg/components/HostingCommittees.tsx` |
| Platform brand colors | `apps/umg/app/globals.css` (CSS variables) |

## Files

| File | Purpose |
|------|---------|
| `apps/umg/app/about-us-new/page.tsx` | New about page (staging) |
| `apps/umg/app/about-us/page.tsx` | Original about page (still live) |
| `apps/umg/app/globals.css` | Platform brand color CSS variables |
| `apps/umg/components/HostingCommittees.tsx` | Reusable partner/committee logo grid |
