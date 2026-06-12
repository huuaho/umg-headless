# apps/umg/components/CompetitionRules.tsx

**Purpose:** The full "Official Competition Rules, Terms, and Conditions" legal text as a static section.

## Responsibilities
Renders nine hardcoded numbered rule groups in fine print: eligibility/compliance, entry validity & disqualification, AI policy & image integrity, participant responsibility (IP, ethics, model releases), ethical photography standards (wildlife), rights & usage (non-exclusive license, 5-year general / perpetual winner-publicity terms, moral-rights waiver), limitation of liability, modification/cancellation/force majeure (fees non-refundable), and an exhibition disclaimer.

## Key exports
- `CompetitionRules() -> JSX`

## Dependencies
- Internal: none (text is hardcoded here, not in the competition config)
- External: none

## Used by
[app/how-to-enter/page.tsx](../app/how-to-enter/page.tsx.md) and [SubmissionForm](../app/photo-submission/components/SubmissionForm.tsx.md) (shown above the consent checkboxes; the "rules & terms" checkbox references this text).

## Notes
Unlike most competition copy, this legal text lives in JSX rather than [lib/competitions/current.ts](../lib/competitions/current.ts.md) — the shorter `aiPolicy`/`originalityStatement`/etc. strings in the config overlap with it and must be kept consistent manually.

---
*Documented at commit 1cbdce5.*
