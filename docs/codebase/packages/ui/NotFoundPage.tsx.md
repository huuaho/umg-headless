# packages/ui/NotFoundPage.tsx

**Purpose:** Shared 404 page body — "404 / Page Not Found" message with a Back to Home button.

## Responsibilities
Renders a centered static layout: large 404 heading, explanation text, and a `next/link` button to `/`.

## Key exports
- `NotFoundPage()` (default) — no props.

## Dependencies
- Internal: none
- External: `next/link`

## Used by
- All three apps' `app/not-found.tsx` (Next.js renders it for unmatched routes and `notFound()` calls).

## Notes
- Server component; no state or IO.

---
*Documented at commit 1cbdce5.*
