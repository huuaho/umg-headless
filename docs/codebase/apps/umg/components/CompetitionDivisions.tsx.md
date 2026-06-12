# apps/umg/components/CompetitionDivisions.tsx

**Purpose:** "Divisions" page section — renders a DivisionCard for every competition division.

## Responsibilities
Full-width gray section with a "Divisions" heading and a 2-column grid mapping `currentCompetition.divisions` to [DivisionCard](DivisionCard.tsx.md)s.

## Key exports
- `CompetitionDivisions() -> JSX`

## Dependencies
- Internal: [lib/competitions/current](../lib/competitions/current.ts.md), [DivisionCard](DivisionCard.tsx.md)
- External: none

## Used by
[app/how-to-enter/page.tsx](../app/how-to-enter/page.tsx.md).

## Notes
Server component; purely presentational, config-driven.

---
*Documented at commit 1cbdce5.*
