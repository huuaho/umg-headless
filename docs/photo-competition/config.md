# Competition Configuration

## Overview

Competition data is centralized in `apps/umg/lib/competitions/` and drives all pages (how-to-enter, submission form, judges panel). This makes it easy to update competition details each year without modifying page components.

## Type Definitions

**File**: `apps/umg/lib/competitions/types.ts`

### `Competition`

The root config object with the following shape:

```typescript
interface Competition {
  // Identity
  id: string;                    // e.g. "my-hometown-my-lens-2026"
  slug: string;                  // URL slug
  title: string;                 // "My Hometown, My Lens"
  year: number;                  // 2026
  status: "upcoming" | "open" | "closed" | "judging" | "complete";

  // Content
  themeDescription: string[];    // Array of paragraphs
  timeline: CompetitionTimeline[];
  divisions: CompetitionDivision[];
  awards: CompetitionAward[];

  // Photo rules
  allowedFormats: string[];      // ["JPEG", "JPG"]
  colorMode: string;             // "RGB"
  minResolution: string;         // "2000px on longest side"
  maxFileSize: string;           // "20MB"
  allowedDevices: string;        // "DSLR, mirrorless, smartphone"
  recencyRequirement?: string;   // "Taken after January 1, 2025"

  // Policy texts
  aiPolicy: string;
  originalityStatement: string;
  consentStatement: string;
  rightsUsageStatement: string;

  // Judging
  evaluationCriteria: EvaluationCriterion[];
  divisionNotes: { divisionId: string; notes: string[] }[];

  // Payment
  stripePaymentLink: string;

  // Exhibition
  exhibitionNote: string;
  venues: { name: string; image?: string }[];
}
```

### `CompetitionDivision`

```typescript
interface CompetitionDivision {
  id: string;              // "youth" | "young-adults"
  name: string;            // "Youth" | "Young Adults"
  ageRange: string;        // "10-18" | "19-30"
  maxPhotos: number;       // 3
  maxDescriptionWords: number; // 100 | 200
  entryFee: string;        // "$50"
  requirements: string[];  // Division-specific rules
}
```

### `EvaluationCriterion`

```typescript
interface EvaluationCriterion {
  name: string;            // e.g. "Relevance to Theme"
  description: string;     // What judges look for
}
```

Note: The `maxScore` field was removed — criteria are descriptive only, not numerically scored.

### `CompetitionAward`

```typescript
interface CompetitionAward {
  place: string;           // "1st Prize", "2nd Prize", etc.
  amount: string;          // "$5,000", "$3,000", etc.
}
```

### `CompetitionTimeline`

```typescript
interface CompetitionTimeline {
  phase: string;           // "Submissions Open", "Jury Review", etc.
  date: string;            // "March 2026", "August 2026", etc.
  description?: string;
}
```

## Current Competition Config

**File**: `apps/umg/lib/competitions/current.ts`

Exports `currentCompetition` — a `Competition` object pre-filled with all 2026 data. Pages import this directly:

```typescript
import { currentCompetition } from "@/lib/competitions/current";
```

### Key Values

| Field | Value |
|-------|-------|
| Title | My Hometown, My Lens |
| Year | 2026 |
| Entry fee | $50 per division |
| Deadline | August 2026 |
| 1st Prize | $5,000 |
| 2nd Prize | $3,000 |
| 3rd Prize | $2,000 |
| Honorable Mention | $800 |
| Payment | Stripe Checkout (pre-configured link) |

### Evaluation Criteria

1. Relevance to Theme
2. Authenticity
3. Clarity of Perspective
4. Visual Storytelling
5. Humanistic Insight
6. Technical Execution

## Updating for a New Competition

To set up a new year's competition:

1. Update `current.ts` with new dates, theme, awards, etc.
2. Update `types.ts` if the data model changes
3. Update judges in `judges.tsx`
4. Update the Stripe payment link
5. Add any new venue images to `public/images/venues/`
