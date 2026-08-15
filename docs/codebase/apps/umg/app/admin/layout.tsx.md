# apps/umg/app/admin/layout.tsx

**Purpose:** Route-segment layout for `/admin/*` — mounts the auth context and the judge gate; marks the section noindex.

## Responsibilities
Wraps children in `AuthProvider` (from `lib/auth/AuthContext`, the same context as `/photo-submission` and `/school-registration`) and then in [AdminGuard](AdminGuard.tsx.md). Exports segment `metadata`: title "Judging Dashboard", a short description, and `robots: { index: false, follow: false }` so the dashboard stays out of search results (it is also absent from [sitemap.ts](../sitemap.ts.md)).

## Key exports
- `default AdminLayout({ children }) -> JSX`
- `metadata` — title/description + noindex.

## Dependencies
- Internal: [lib/auth/AuthContext](../../lib/auth/AuthContext.tsx.md), [AdminGuard](AdminGuard.tsx.md)
- External: none

## Used by
App Router — wraps [page.tsx](page.tsx.md), [entry/page.tsx](entry/page.tsx.md), [results/page.tsx](results/page.tsx.md).

## Notes
Server component; the guard beneath is client-side. Unlike the competition pages, `/admin` was deliberately **left live** when the competition was postponed on 2026-08-13 (no `notFound()` guard here) so judges/admins can still reach it.

---
*Documented at commit bde729d.*
