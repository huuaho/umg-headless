# apps/umg/app/school-registration/application/page.tsx

**Purpose:** Route for creating/editing/viewing a single school application, addressed by id.

## Responsibilities
Reads the application id from `?id=` (`useSearchParams`), redirects to `/school-registration` if not signed in or if no valid id is present, and otherwise renders [SchoolApplicationForm](../components/SchoolApplicationForm.tsx.md) for that id. Wrapped in `Suspense` (required for `useSearchParams()` under this codebase's static-export convention).

## Key exports
- `default SchoolApplicationPage() -> JSX` — the `/school-registration/application` route.

## Dependencies
- Internal: [lib/auth/AuthContext](../../../lib/auth/AuthContext.tsx.md) (`useAuth`), [../components/SchoolApplicationForm](../components/SchoolApplicationForm.tsx.md)
- External: `next/navigation` (`useSearchParams`, `useRouter`), React (`Suspense`)

## Used by
App Router — route `/school-registration/application?id=<n>`; reached from [../components/ApplicationsCart.tsx](../components/ApplicationsCart.tsx.md)'s "Edit"/"View" links and its "Add another application" button (which creates a blank application first, then navigates here with the new id).

## Notes
`"use client"`. If `id` is missing or not a number, renders a plain "No application specified" message rather than redirecting — this only happens if the URL is hand-edited, since every real navigation path always includes a valid id.

---
*Documented at commit e5821d4.*
