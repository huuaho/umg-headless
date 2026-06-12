# apps/umg/app/not-found.tsx

**Purpose:** 404 page — one-line re-export of the shared NotFoundPage.

## Responsibilities
Re-exports `NotFoundPage` from `@umg/ui` as the route default, so the 404 UI is identical across all three apps.

## Key exports
- `default` — `NotFoundPage` from `@umg/ui`.

## Dependencies
- Internal: `@umg/ui` [NotFoundPage](../../../packages/ui/NotFoundPage.tsx.md)
- External: none

## Used by
App Router — rendered for unmatched routes.

## Notes
Trivial; no local customization.

---
*Documented at commit 1cbdce5.*
