# apps/umg/components/PhotoRequirements.tsx

**Purpose:** "Photo Requirements" section — format, color mode, resolution, file size, and allowed devices.

## Responsibilities
Renders a 4-tile grid from the competition config: accepted formats (JPEG/JPG), color mode (RGB), min resolution (2,000 px longest side), max file size (20 MB), plus a capitalized allowed-devices line (camera, tablet, smartphone).

## Key exports
- `PhotoRequirements() -> JSX`

## Dependencies
- Internal: [lib/competitions/current](../lib/competitions/current.ts.md)
- External: none

## Used by
[app/how-to-enter/page.tsx](../app/how-to-enter/page.tsx.md) and [SubmissionForm](../app/photo-submission/components/SubmissionForm.tsx.md).

## Notes
Display only — the actual enforcement of these limits happens client-side in SubmissionForm and server-side in the WP plugin ([includes/draft.php](../../../plugin/umg-photo-contest/includes/draft.php.md)).

---
*Documented at commit 1cbdce5.*
