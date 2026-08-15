# apps/umg/lib/judging/types.ts

**Purpose:** TypeScript shapes for the judge-panel REST API (`/wp-json/umg/v1/admin/*`) — mirrors the WP plugin's [judging.php](../../../../plugin/umg-photo-contest/includes/judging.php.md) JSON contracts.

## Responsibilities
Defines what the judging dashboard exchanges with the plugin:

- `JudgingPhoto` — `{ url, title, description }` as shown to judges (no media ids).
- `EntryIdentity` — `first_name`, `last_name`, `school`, `grade`, optional `recommender?` (only once the plugin's recommender update is deployed). **Identity-gated:** the plugin includes it only for admins, or for everyone when blind judging is switched off server-side (`umgpc_blind_judging` option) — so it is optional on the list/detail types and required only on `ResultsRow` (admin-only endpoint).
- `ScoreStatus` — `"unscored" | "draft" | "final"` (the *current judge's* status for an entry).
- `SubmissionSummary` / `SubmissionList` — one card in the dashboard grid (`id`, `division`, `submitted_at`, `photos`, `my_score_status`, `my_total`, `identity?`) and the paginated envelope (`entries`, `total`, `page`, `per_page`, `blind`).
- `JudgeScore` — a stored score: `judge_id`, `scores: Record<criterionKey, number>`, `total`, `notes`, `criteria_version`, `status: "draft" | "final"`, `updated_at`.
- `SubmissionDetail` — the entry page payload: photos + `biography`, `my_score: JudgeScore | null`, `blind`, `identity?`.
- `SaveScorePayload` — what `PUT /admin/submissions/:id/score` sends: `scores`, `notes`, `status`, `criteria_version`.
- `ResultsRow` — admin aggregate: `identity` (always present), `judge_count`, `final_count`, `average_total`, `criterion_averages`, `rank` (null until finals exist).

## Key exports
- `JudgingPhoto`, `EntryIdentity`, `ScoreStatus`, `SubmissionSummary`, `SubmissionList`, `JudgeScore`, `SubmissionDetail`, `SaveScorePayload`, `ResultsRow`

## Dependencies
- Internal: none
- External: none

## Used by
[api.ts](api.ts.md), [app/admin/page.tsx](../../app/admin/page.tsx.md), [app/admin/entry/EntryScoring.tsx](../../app/admin/entry/EntryScoring.tsx.md), [app/admin/results/page.tsx](../../app/admin/results/page.tsx.md).

## Notes
snake_case to match the plugin JSON exactly; changes must be coordinated with the plugin's `judging.php` (not yet documented in this mirror — the plugin docs stop at the pre-judging file set). The `scores` record is keyed by the slug produced by `criterionKey()` in [api.ts](api.ts.md), which must equal PHP `sanitize_title` of the criterion name. `criteria_version` is stamped with `currentCompetition.id` so scores can be tied to the criteria set they were made against.

---
*Documented at commit bde729d.*
