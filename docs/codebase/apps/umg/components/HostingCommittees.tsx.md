# apps/umg/components/HostingCommittees.tsx

**Purpose:** Logo grid of the competition's hosting committees / partners.

## Responsibilities
Renders a configurable-title section (defaults "Hosting Committees") with a 2-column grid of four organizations defined in a local array: United Media Group (reuses `/umg-logo.svg`), Chennault Foundation, MLK Jr. International Salute Committee (the only one with an external `href`), and UNESCO Center for Peace. Logos come from `public/images/sponsors/`. Accepts `title`, `titleClassName`, and optional `subtitle` props so the about-us page can restyle it as "Our Partners".

## Key exports
- `HostingCommittees({ title?, titleClassName?, subtitle? }) -> JSX`

## Dependencies
- Internal: none (data hardcoded)
- External: `next/image`

## Used by
[app/how-to-enter/page.tsx](../app/how-to-enter/page.tsx.md), [app/about-us/page.tsx](../app/about-us/page.tsx.md), and [app/photo-submission/page.tsx](../app/photo-submission/page.tsx.md) (shown when signed in).

## Notes
Labels use `\n` + `whitespace-pre-line` for controlled two-line wrapping. Entries without `href` render as plain divs.

---
*Documented at commit 1cbdce5.*
