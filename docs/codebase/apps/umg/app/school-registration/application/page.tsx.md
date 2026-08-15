# apps/umg/app/school-registration/application/page.tsx

**Purpose:** Route for creating/editing/viewing a single school application, addressed by id. **Currently hidden (404)** while the competition is postponed.

## Responsibilities
As of the "hide competition page" commit `SchoolApplicationPage` calls `notFound()` before returning, so this route renders the 404 page; the logic below is intact but dormant.

When live: reads the application id from `?id=` (`useSearchParams`), redirects to `/school-registration` if not signed in or if no valid id is present, and otherwise renders [SchoolApplicationForm](../components/SchoolApplicationForm.tsx.md) for that id. Wrapped in `Suspense` (required for `useSearchParams()` under this codebase's static-export convention).

## Key exports
- `default SchoolApplicationPage() -> JSX` — the `/school-registration/application` route.

## Dependencies
- Internal: [lib/auth/AuthContext](../../../lib/auth/AuthContext.tsx.md) (`useAuth`), [../components/SchoolApplicationForm](../components/SchoolApplicationForm.tsx.md)
- External: `next/navigation` (`notFound`, `useSearchParams`, `useRouter`), React (`Suspense`)

## Used by
App Router — route `/school-registration/application?id=<n>`; reached from [../components/ApplicationsCart.tsx](../components/ApplicationsCart.tsx.md)'s "Edit"/"View" links and its "Add another application" button (which creates a blank application first, then navigates here with the new id).

## Notes
**Competition postponed indefinitely (client request, 2026-08-13):** delete the `notFound()` line to restore (grep "Competition postponed indefinitely" for the full set — the school layout's metadata is commented out alongside).

`"use client"`. If `id` is missing or not a number, renders a plain "No application specified" message rather than redirecting — this only happens if the URL is hand-edited, since every real navigation path always includes a valid id.

---
*Documented at commit bde729d.*
