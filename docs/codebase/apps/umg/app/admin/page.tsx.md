# apps/umg/app/admin/page.tsx

**Purpose:** Judging dashboard home — grid of submitted entries with the signed-in judge's scoring status, filterable by division and status.

## Responsibilities
Client page. On mount (and whenever the division filter changes) calls `listSubmissions(token, { division })` and renders: a header ("Judging Dashboard", signed-in email, a **Results** link visible only when `user.is_admin`, Sign out), a summary line ("N submitted entries · you have finalized M"), two `<select>` filters (division from `currentCompetition.divisions`; status `unscored | draft | final` — the status filter is applied client-side over the loaded page), and a responsive 1/2/3-column card grid. Each card links to `/admin/entry/?id=<id>` and shows the first photo (plain `<img>`, lazy), "Entry #id", a coloured status badge (`STATUS_LABELS`/`STATUS_STYLES`, with `· <my_total>` when scored), division name, entrant name if `identity` is present (i.e. not blind / admin), and photo count. Error state has a Retry button; empty state says no entries match.

## Key exports
- `default AdminSubmissionsPage() -> JSX` — the `/admin` route.

## Dependencies
- Internal: [lib/auth/AuthContext](../../lib/auth/AuthContext.tsx.md), [lib/judging/api](../../lib/judging/api.ts.md) (`listSubmissions`), [lib/judging/types](../../lib/judging/types.ts.md), [lib/competitions/current](../../lib/competitions/current.ts.md) (division names)
- External: `next/link`, React

## Used by
App Router — route `/admin`, behind [AdminGuard](AdminGuard.tsx.md) via [layout.tsx](layout.tsx.md). Not linked from the public site nav.

## Notes
`"use client"`. Uses raw `<img>` rather than `next/image` (remote WP upload URLs; static export). Ignores `page`/`per_page` in the response — no pagination UI yet, so only the first server page is shown. Trailing-slash hrefs (`/admin/results/`, `/admin/entry/?id=`) match the app's `trailingSlash: true` static-export convention.

---
*Documented at commit bde729d.*
