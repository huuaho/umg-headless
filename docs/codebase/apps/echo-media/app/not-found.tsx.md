# apps/echo-media/app/not-found.tsx

**Purpose:** 404 page — one-line re-export of the shared `NotFoundPage` component.

## Responsibilities
Registers the App Router `not-found` boundary for the whole app by re-exporting `NotFoundPage` from `@umg/ui` as the default export. Shown for unmatched routes and whenever a page calls `notFound()` (e.g. an unknown article slug).

## Key exports
- `default` — re-exported `NotFoundPage` from `@umg/ui`.

## Dependencies
- Internal: [@umg/ui NotFoundPage](../../../packages/ui/NotFoundPage.tsx.md)
- External: none

## Used by
Next.js App Router — 404 boundary; triggered by [app/articles/[slug]/page.tsx](articles/[slug]/page.tsx.md) via `notFound()` and by any unmatched URL.

## Notes
- The entire file is `export { NotFoundPage as default } from "@umg/ui";` — branding comes from the shared component plus the site's layout (Header/Footer still wrap it).
- **Difference vs international-spectrum:** none; the files are byte-identical.

---
*Documented at commit 1cbdce5.*
