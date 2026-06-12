# apps/umg/app/how-to-enter/page.tsx

**Purpose:** Photo-competition landing page — the full public brochure for "My Hometown, My Lens".

## Responsibilities
Renders the competition marketing page entirely from the config in `lib/competitions/current.ts`:

1. Hero banner (gradient, Libre Franklin display type).
2. Theme intro + "About the Theme" paragraphs.
3. Numbered timeline (submissions open → deadline → jury review → winners → exhibitions).
4. [CompetitionDivisions](../../components/CompetitionDivisions.tsx.md) and [PhotoRequirements](../../components/PhotoRequirements.tsx.md) sections.
5. Awards grid ($ amounts × recipients per division) and exhibition venue cards — venue names map to local images via the in-file `venueImages` record (`public/images/venues/*.jpg`).
6. Evaluation criteria list.
7. "Meet the Judges" grid of portrait thumbnails from [lib/competitions/judges](../../lib/competitions/judges.tsx.md), each linking to `/judges-panel#<judge-id>`.
8. "Apply Now" CTA linking to `/photo-submission`.
9. [CompetitionRules](../../components/CompetitionRules.tsx.md) legal text and [HostingCommittees](../../components/HostingCommittees.tsx.md).

## Key exports
- `default HowToEnterPage() -> JSX` — the `/how-to-enter` route.

## Dependencies
- Internal: [lib/competitions/current](../../lib/competitions/current.ts.md), [lib/competitions/judges](../../lib/competitions/judges.tsx.md), [components/CompetitionDivisions](../../components/CompetitionDivisions.tsx.md), [components/PhotoRequirements](../../components/PhotoRequirements.tsx.md), [components/CompetitionRules](../../components/CompetitionRules.tsx.md), [components/HostingCommittees](../../components/HostingCommittees.tsx.md)
- External: `next/image`, `next/link`

## Used by
App Router — route `/how-to-enter`; the Header announcement banner and extra nav link in [app/layout.tsx](../layout.tsx.md) point here, as do the about-us page and the submitted-state view of the submission form.

## Notes
Server component, fully static. Adding an exhibition venue to the config requires also adding its image to the `venueImages` map (missing venues render an empty-src Image). The last venue centers itself when the count is odd. See also the prose docs in `docs/photo-competition/`.

---
*Documented at commit 1cbdce5.*
