# apps/umg/components/DivisionCard.tsx

**Purpose:** Card showing one division's facts: fee, photo limits, requirements, and judging notes.

## Responsibilities
Looks up a division by id in `currentCompetition.divisions` and renders its name, age range, entry fee, max photos, description word limit, biography required/optional, the bulleted `requirements` list, and (if present) the division-specific judging note from `divisionJudgingNotes`. Returns `null` for unknown ids.

## Key exports
- `DivisionCard({ divisionId }: { divisionId: string }) -> JSX | null`

## Dependencies
- Internal: [lib/competitions/current](../lib/competitions/current.ts.md)
- External: none

## Used by
[CompetitionDivisions](CompetitionDivisions.tsx.md) (how-to-enter page, both divisions) and [SubmissionForm](../app/photo-submission/components/SubmissionForm.tsx.md) (shows only the selected division).

## Notes
No client interactivity; safe in server and client trees.

---
*Documented at commit 1cbdce5.*
