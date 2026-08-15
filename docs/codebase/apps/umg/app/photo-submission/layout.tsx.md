# apps/umg/app/photo-submission/layout.tsx

**Purpose:** Route-segment layout that scopes the competition auth context to `/photo-submission`.

## Responsibilities
Wraps the photo-submission subtree in `AuthProvider` from `lib/auth/AuthContext`, so only this route pays the cost of token restoration / `GET /me` on load. The rest of the site has no auth.

## Key exports
- `default PhotoSubmissionLayout({ children }) -> JSX`
- ~~`metadata`~~ — the title "Photo Submission" + description export is **commented out** while the competition is postponed, so the 404 now served at this route doesn't carry competition SEO text. Uncomment to restore (it covers the client-component page, which can't export metadata itself).

## Dependencies
- Internal: [lib/auth/AuthContext](../../lib/auth/AuthContext.tsx.md)
- External: none

## Used by
App Router — wraps [photo-submission/page.tsx](page.tsx.md).

## Notes
**Competition postponed indefinitely (client request, 2026-08-13):** [page.tsx](page.tsx.md) calls `notFound()`, so this layout currently only wraps a 404; the `AuthProvider` still mounts. Grep "Competition postponed indefinitely" for the full set of hidden pieces.

If other routes ever need auth (e.g. a "my entry" page), move the provider up or duplicate this layout.

---
*Documented at commit bde729d.*
