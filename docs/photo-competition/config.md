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
  id: string;                    // e.g. "2026-youth-photography"
  slug: string;                  // URL slug
  title: string;                 // "My Hometown, My Lens"
  subtitle: string;              // "International Youth Photography Competition"
  year: number;                  // 2026
  status: "upcoming" | "open" | "closed" | "judging" | "complete";

  // Content
  themeIntro: string;            // Single paragraph theme introduction
  themeDescription: string[];    // Array of paragraphs
  timeline: CompetitionTimeline[];
  divisions: CompetitionDivision[];
  awards: CompetitionAward[];
  exhibitionVenues: string[];    // e.g. ["Library of Congress", "Smithsonian Museum"]

  // Photo rules
  acceptedFormats: string[];     // ["JPEG", "JPG"]
  colorMode: string;             // "RGB"
  maxFileSizeMB: number;         // 20
  minResolutionPx: number;       // 2000
  allowedDevices: string[];      // ["camera", "tablet", "smartphone"]

  // Rules text
  aiPolicy: string;
  originalityStatement: string;
  consentStatement: string;
  rightsStatement: string;

  // Judging
  evaluationCriteria: EvaluationCriterion[];
  divisionJudgingNotes: Record<string, string>;

  // Payment
  stripePaymentLink: string;

  // Submission config
  personalInfoFields: string[];  // ["name", "dob", "address", "school", "grade", "job"]
}
```

### `CompetitionDivision`

```typescript
interface CompetitionDivision {
  id: string;                // "youth" | "young-adults"
  name: string;              // "Youth Division" | "Young Adults Division"
  ageRange: string;          // "10–18 (including 18)" | "18–30 (excluding 18)"
  ageMin: number;            // 10 | 19
  ageMax: number;            // 18 | 30
  maxPhotos: number;         // 3
  maxDescriptionWords: number; // 100 | 200
  biographyRequired: boolean;  // false (Youth) | true (Young Adults)
  entryFee: number;          // 50
  requirements: string[];    // Division-specific rules
  themeDescription: string[]; // Division-specific theme guidance
}
```

### `EvaluationCriterion`

```typescript
interface EvaluationCriterion {
  name: string;            // e.g. "Relevance to the Theme"
  description: string;     // What judges look for
}
```

Note: The `maxScore` field was removed — criteria are descriptive only, not numerically scored.

### `CompetitionAward`

```typescript
interface CompetitionAward {
  place: string;                  // "First Prize", "Second Prize", etc.
  recipientsPerDivision: number;  // e.g. 1, 2, 3, 20
  amount: number;                 // Dollar amount (e.g. 8000)
}
```

### `CompetitionTimeline`

```typescript
interface CompetitionTimeline {
  label: string;           // "Submissions Open", "Jury Review", etc.
  date: string;            // "March 16, 2026", "August 31, 2026", etc.
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
| Deadline | August 31, 2026 |
| 1st Prize | $8,000 |
| 2nd Prize | $4,000 (2 per division) |
| 3rd Prize | $2,000 (3 per division) |
| Honorable Mention | $500 (20 per division) |
| Payment | Stripe Checkout (pre-configured link) |

### Evaluation Criteria

1. Relevance to the Theme
2. Authenticity and Sincerity of Expression
3. Clarity of Personal Perspective
4. Visual Storytelling and Composition
5. Humanistic Insight and Cultural Value
6. Technical Execution

## Updating for a New Competition

To set up a new year's competition:

1. Update `current.ts` with new dates, theme, awards, etc.
2. Update `types.ts` if the data model changes
3. Update judges in `judges.tsx`
4. Update the Stripe payment link
5. Add any new venue images to `public/images/venues/`
