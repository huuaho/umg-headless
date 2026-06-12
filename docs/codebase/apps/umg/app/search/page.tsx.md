# apps/umg/app/search/page.tsx

**Purpose:** Search route — thin wrapper around the shared SearchContent component.

## Responsibilities
Renders `SearchContent` from `@umg/ui` with `externalOnly`, meaning results link out to the original media-company sites (Diplomatic Watch / Echo Media / International Spectrum) rather than to local article pages — the UMG site is an aggregator with no article detail routes.

## Key exports
- `default SearchPage() -> JSX` — the `/search` route.

## Dependencies
- Internal: `@umg/ui` [SearchContent](../../../../packages/ui/SearchContent.tsx.md)
- External: none

## Used by
App Router — route `/search` (linked from the Header's search UI).

## Notes
All query handling, fetching, and result rendering live in `packages/ui`.

---
*Documented at commit 1cbdce5.*
