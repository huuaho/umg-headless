# apps/umg/lib/competitions/types.ts

**Purpose:** TypeScript shapes for competition configuration.

## Responsibilities
Pure type definitions for the photo-competition config object:

- `Competition` — the root shape: identity (`id`, `slug`, `title`, `year`, `status: "upcoming" | "open" | "closed" | "judging" | "complete"`), content (theme texts, `timeline`, `divisions`, `awards`, exhibition venues/note), photo rules (formats, color mode, max MB, min px, devices), legal statement strings (`aiPolicy`, `originalityStatement`, `consentStatement`, `rightsStatement`), judging (`evaluationCriteria`, per-division `divisionJudgingNotes`), `stripePaymentLink`, and `personalInfoFields`.
- `CompetitionDivision` — id, name, age range/min/max, `maxPhotos`, `maxDescriptionWords`, `biographyRequired`, `entryFee`, `requirements[]`, `themeDescription[]`.
- `CompetitionAward` — place, recipients per division, dollar amount.
- `CompetitionTimeline`, `EvaluationCriterion` — label/date/description and name/description pairs.

## Key exports
- `Competition`, `CompetitionDivision`, `CompetitionAward`, `CompetitionTimeline`, `EvaluationCriterion` (all interfaces)

## Dependencies
- Internal: none
- External: none

## Used by
[current.ts](current.ts.md) (typed config), [SubmissionForm](../../app/photo-submission/components/SubmissionForm.tsx.md) (imports `CompetitionDivision`).

## Notes
Types only — no runtime code. `status` and `personalInfoFields` are defined but not currently read by any UI (pages render unconditionally); the WP plugin keeps its own server-side notion of validity.

---
*Documented at commit 1cbdce5.*
