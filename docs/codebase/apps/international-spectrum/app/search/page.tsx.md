# apps/international-spectrum/app/search/page.tsx

**Purpose:** Search route — thin wrapper that renders the shared `SearchContent` component.

## Responsibilities
Renders `<SearchContent />` for the `/search` route. All behavior — the search bar, reading the `?search=` query param, client-side fetching via `@umg/api`, pagination, loading skeletons, and error/empty states — lives in the shared component (documented in `docs/search/SearchPage.md`).

## Key exports
- `SearchPage() -> JSX` — default export; the `/search` route.

## Dependencies
- Internal: [@umg/ui SearchContent](../../../../packages/ui/SearchContent.tsx.md)
- External: none

## Used by
Next.js App Router — the `/search` route. The Header's search icon/form navigates here with `?search=<query>`.

## Notes
- Statically exported shell; results load entirely client-side, so the static export still supports arbitrary queries.
- `SearchContent` wraps its inner component in `Suspense` (required for `useSearchParams` under static export).
- **Difference vs echo-media:** none; the files are byte-identical.

---
*Documented at commit 1cbdce5.*
