# apps/umg/lib/judging/api.ts

**Purpose:** Typed fetch client for the judge-panel endpoints (`/wp-json/umg/v1/admin/*`) plus the criterion-slug helper.

## Responsibilities
Same shape as [lib/auth/api.ts](../auth/api.ts.md) and [lib/school/api.ts](../school/api.ts.md): builds `API_BASE` from `NEXT_PUBLIC_WP_API_URL` (fallback `https://www.api.unitedmediadc.com/wp-json`) + `/umg/v1`, sends `Authorization: Bearer <jwt>` (the same JWT the entrant login issues), and converts non-OK responses into `CompetitionApiError` (reused from `lib/auth/api.ts` so callers can `instanceof` one class). Duplicates `handleResponse`/`authHeaders` locally rather than exporting them from `lib/auth/api.ts` — a small copy-paste kept to leave that module untouched.

## Key exports
- `listSubmissions(token, { division?, page? }) -> SubmissionList` — `GET /admin/submissions[?division=&page=]`. Judge capability required.
- `getSubmission(token, id) -> SubmissionDetail` — `GET /admin/submissions/:id`.
- `saveScore(token, id, payload: SaveScorePayload) -> JudgeScore` — `PUT /admin/submissions/:id/score` (JSON body). Once a judge's score is `final` the plugin refuses further edits unless the caller is an admin.
- `getResults(token) -> { results: ResultsRow[] }` — `GET /admin/results`. Admin capability required.
- `criterionKey(name) -> string` — lower-cases and slugifies a criterion name (`/[^a-z0-9]+/g` → `-`, trims dashes). Must yield the same slug the plugin stores via `sanitize_title`; ASCII criterion names only.

## Dependencies
- Internal: [../auth/api.ts](../auth/api.ts.md) (`CompetitionApiError`), [types](types.ts.md)
- External: browser `fetch`

## Used by
[app/admin/page.tsx](../../app/admin/page.tsx.md) (`listSubmissions`), [app/admin/entry/EntryScoring.tsx](../../app/admin/entry/EntryScoring.tsx.md) (`getSubmission`, `saveScore`, `criterionKey`), [app/admin/results/page.tsx](../../app/admin/results/page.tsx.md) (`getResults`).

## Notes
Server counterpart is the plugin's [judging.php](../../../../plugin/umg-photo-contest/includes/judging.php.md) (routes above; capabilities `umgpc_judge_submissions` / `umgpc_admin_results` from [roles.php](../../../../plugin/umg-photo-contest/includes/roles.php.md)). Blind judging is a WP option (`umgpc_blind_judging`, default on) so the `blind` flag and presence of `identity` in responses can flip without a frontend deploy. No pagination UI exists yet on the frontend even though `page` is accepted. Judge panel v1 is live but parked pending client UX feedback (see `claude-context/paused-work/judge-panel-parked.md`).

---
*Documented at commit bde729d.*
