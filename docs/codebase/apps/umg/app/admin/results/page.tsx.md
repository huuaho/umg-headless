# apps/umg/app/admin/results/page.tsx

**Purpose:** Admin-only aggregated results — per-division ranking tables of average totals across judges' final scores.

## Responsibilities
Client page. If the user is a judge but not `is_admin`, renders "Aggregated results are visible to administrators only" with a back link (AdminGuard already guarantees `is_judge`; this is the second, admin-level check — the plugin enforces `umgpc_admin_results` on the endpoint regardless). Otherwise calls `getResults(token)` and groups `ResultsRow`s by division, rendering one table per division: Rank, Entry (link to `/admin/entry/?id=`), Entrant (`identity.first_name last_name` — always present here since results are admin-only), Avg total, and "Judges (final)" as `judge_count (final_count final)`. Nulls render as "—". Error state has Retry; empty state says no submitted entries yet.

## Key exports
- `default AdminResultsPage() -> JSX` — the `/admin/results` route.

## Dependencies
- Internal: [lib/auth/AuthContext](../../../lib/auth/AuthContext.tsx.md), [lib/judging/api](../../../lib/judging/api.ts.md) (`getResults`), [lib/judging/types](../../../lib/judging/types.ts.md), [lib/competitions/current](../../../lib/competitions/current.ts.md) (division names)
- External: `next/link`, React

## Used by
App Router — route `/admin/results`; linked from the "Results" link on [../page.tsx](../page.tsx.md) (shown only to admins).

## Notes
`"use client"`. `criterion_averages` is returned by the API but not displayed yet. Ranking is computed server-side (`rank` is null until at least one final score exists). No export/CSV; the parked-work doc lists results UX among the open questions for the client.

---
*Documented at commit bde729d.*
