# apps/umg/app/school-registration/components/SchoolApplicationForm.tsx

**Purpose:** Create/edit/view form for one student's application within a school's batch.

## Responsibilities
Full entry form for a single application, addressed by `applicationId`: division selection, student info (name/DOB/address/school/grade/major), up to 3 photo uploads with title/description, biography, social-media consent + links, and the four required consent checkboxes — the same field set as the individual flow's `SubmissionForm.tsx` minus student-proof upload (waived for school applications per product decision). Autosaves 2 seconds after any field change (while still a draft), uploads photos immediately on selection, and on submit finalizes the application and returns to the cart. Once `status === "submitted"`, renders a read-only summary instead of the form (division, full student info, biography, social links, a consent checklist, and photos) — expanded 2026-07-03 to show the same information density as the individual flow's own read-only view, previously only showing name/division/photos.

## Key exports
- `default SchoolApplicationForm({ applicationId }) -> JSX`

## Dependencies
- Internal: [lib/competitions/current](../../../lib/competitions/current.ts.md), [lib/competitions/types](../../../lib/competitions/types.ts.md), [lib/auth/AuthContext](../../../lib/auth/AuthContext.tsx.md) (`useAuth`), [components/DivisionCard](../../../components/DivisionCard.tsx.md), [components/PhotoRequirements](../../../components/PhotoRequirements.tsx.md), [components/CompetitionRules](../../../components/CompetitionRules.tsx.md), [lib/school/api](../../../lib/school/api.ts.md) (`getApplication`, `saveApplication`, `submitApplication`, `uploadPhoto`, `removePhoto`)
- External: `next/navigation` (`useRouter`), React (`useState`, `useRef`, `useEffect`, `useCallback`)

## Used by
Rendered by [../application/page.tsx](../application/page.tsx.md) for a given `?id=`.

## Notes
- **Built as a dedicated component, not a parameterized version of `SubmissionForm.tsx`** — same additive-only philosophy as the backend. A high-effort code review (2026-07-03) flagged this as a real duplication cost: roughly 900 lines of state, autosave, and photo-upload logic are effectively copy-pasted between the two forms, so a validation or UX fix made in one won't propagate to the other unless a maintainer remembers both files exist. Left as-is for now (would need extracting a shared form component/hook, a larger change than a bug fix); worth doing in a fast-follow.
- **Load-failure handling** (added 2026-07-03, commit 10 polish): a failed `getApplication` call previously fell through to a blank editable form with only a small error line near the submit button. Now shows a dedicated "Could not load this application" screen (Try again / Back to applications) before the form renders at all. The load logic is a `useCallback`d `loadApplication` function so "Try again" can re-trigger it without duplicating the effect body.
- **Division validation on load:** if the loaded `division` value isn't one of `competition.divisions`' known ids (e.g. stale/hand-crafted test data), falls back to the first division rather than crashing — found live 2026-07-03 when a test record with an invalid `division: "teen"` threw `Cannot read property 'biographyRequired' of undefined` on load.
- Photos: client-side validates JPEG-only and the competition's max file size before uploading; server-side validation in `school.php`/`draft.php` is the actual source of truth (matches file contents via `finfo`, not just the client's reported MIME type).
- `"use client"` — fully client-rendered, autosave state lives only in this component (no offline/local persistence beyond the debounce timer).

---
*Documented at commit e5821d4.*
