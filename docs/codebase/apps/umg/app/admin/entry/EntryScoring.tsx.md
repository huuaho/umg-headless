# apps/umg/app/admin/entry/EntryScoring.tsx

**Purpose:** The per-entry judging view — shows an entry's photos/bio and lets the signed-in judge score it against the competition criteria (draft or final).

## Responsibilities
Reads `?id=` via `useSearchParams`, loads `getSubmission(token, id)`, and pre-fills `scores`/`notes` from `detail.my_score` if the judge already scored it. Layout is a 3/2 grid:

- **Left — the work:** every photo (`<img>` + title/description caption), the biography, and — only when `entry.identity?.recommender` is present (identity-gated: absent under blind judging, admins only) — a Recommender block. Header shows "Entry #id", division name, entrant name if identity is present, and `submitted_at`.
- **Right — sticky scoring form:** one row per criterion from `currentCompetition.evaluationCriteria` (6 criteria; keys via `criterionKey(name)`), each a 1–10 button strip (`SCORE_MIN`/`SCORE_MAX`), an optional Notes textarea, a live "Total: X / 60" line with "(k/6 criteria scored)" until all are set, and per-division judging note (`divisionJudgingNotes`) in italics. Buttons: **Save draft** (enabled once any score exists) and **Submit final** (enabled only when `allScored`; `window.confirm` first). Both call `saveScore(token, id, { scores, notes, status, criteria_version: currentCompetition.id })` and replace `entry.my_score` with the returned `JudgeScore`.
- When `my_score.status === "final"` the form is locked (heading "Your final score", inputs disabled, message to contact an administrator).

Error handling: 404 from the API → "Entry not found."; other load errors → generic message with a back link; save errors surface the `CompetitionApiError` message. `!id` renders "No entry selected."

## Key exports
- `EntryScoring() -> JSX`

## Dependencies
- Internal: [lib/auth/AuthContext](../../../lib/auth/AuthContext.tsx.md), [lib/judging/api](../../../lib/judging/api.ts.md) (`getSubmission`, `saveScore`, `criterionKey`), [lib/judging/types](../../../lib/judging/types.ts.md), [lib/competitions/current](../../../lib/competitions/current.ts.md) (criteria, division names, judging notes), [lib/auth/api](../../../lib/auth/api.ts.md) (`CompetitionApiError`)
- External: `next/link`, `next/navigation` (`useSearchParams`), React

## Used by
[page.tsx](page.tsx.md) (inside `Suspense`).

## Notes
`"use client"`. The criteria list and max score are frontend-derived (`evaluationCriteria.length × 10`); the plugin stores whatever `scores` record it receives keyed by slug, so renaming a criterion in `current.ts` changes its key — `criteria_version` exists to detect that. Final scores are locked client-side *and* server-side (plugin refuses non-admin edits to a `final` score). Recommender was added in the "Client content update" commit alongside the entrant-form field. Judge panel v1 is parked awaiting client UX feedback (open questions in `claude-context/paused-work/judge-panel-parked.md`).

---
*Documented at commit bde729d.*
