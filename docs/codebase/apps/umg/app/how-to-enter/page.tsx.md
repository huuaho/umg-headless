# apps/umg/app/how-to-enter/page.tsx

**Purpose:** Photo-competition landing page — the full public brochure for "My Hometown, My Lens". **Currently hidden (404)** while the competition is postponed.

## Responsibilities
As of the "hide competition page" commit the component's first statement is `notFound()` (from `next/navigation`), so `/how-to-enter` renders the app's 404 page; everything described below is intact but dormant until that line is deleted.

Builds three structured-data objects from the config (so schema/copy can't drift), emits them as `<script type="application/ld+json">` tags, and exports page `metadata` (competition-specific title + description):

- **Event JSON-LD** — name/organizer/description/`offers.price` ($50)/`typicalAgeRange` (10-30)/venues, all from config; `startDate` 2026-03-16 and `endDate` 2027-03-31 are hardcoded ISO constants (the config timeline stores prose dates). Worldwide eligibility, online attendance mode.
- **FAQPage JSON-LD** — `mainEntity` generated from the local `faqs` array (7 Q&As) that also renders the visible FAQ section.

Then the marketing brochure, rendered from `lib/competitions/current.ts`:

1. Hero banner (gradient, Libre Franklin display type).
2. Theme intro + "About the Theme" paragraphs.
3. Numbered timeline (submissions open → deadline → jury review → winners → exhibitions).
4. [CompetitionDivisions](../../components/CompetitionDivisions.tsx.md) and [PhotoRequirements](../../components/PhotoRequirements.tsx.md) sections.
5. Awards grid ($ amounts × recipients per division) and exhibition venue cards — venue names map to local images via the in-file `venueImages` record (`public/images/venues/*.jpg`).
6. Evaluation criteria list.
7. "Meet the Judges" grid of portrait thumbnails from [lib/competitions/judges](../../lib/competitions/judges.tsx.md), each linking to `/judges-panel#<judge-id>`.
8. "Apply Now" CTA linking to `/photo-submission`, plus a secondary "Apply as a school" link to `/school-registration` (registering multiple students under one school account).
9. [CompetitionRules](../../components/CompetitionRules.tsx.md) legal text, the visible FAQ section ("Frequently Asked Questions", 7 Q&As), and [HostingCommittees](../../components/HostingCommittees.tsx.md).

## Key exports
- `default HowToEnterPage() -> JSX` — the `/how-to-enter` route; renders Event + FAQPage JSON-LD.
- `metadata` — competition title + description.

## Dependencies
- Internal: [lib/competitions/current](../../lib/competitions/current.ts.md), [lib/competitions/judges](../../lib/competitions/judges.tsx.md), [components/CompetitionDivisions](../../components/CompetitionDivisions.tsx.md), [components/PhotoRequirements](../../components/PhotoRequirements.tsx.md), [components/CompetitionRules](../../components/CompetitionRules.tsx.md), [components/HostingCommittees](../../components/HostingCommittees.tsx.md)
- External: `next/image`, `next/link`, `next/navigation` (`notFound`)

## Used by
App Router — route `/how-to-enter`. When live, the Header announcement banner and extra nav link in [app/layout.tsx](../layout.tsx.md) point here, as do the about-us promo section and the submitted-state view of the submission form — all of those inbound links are currently commented out too.

## Notes
**Competition postponed indefinitely (client request, 2026-08-13):** delete the `notFound()` line to restore, and uncomment the sitemap entry, layout nav/banner and about-us section (grep "Competition postponed indefinitely"). Note the `metadata` export still exists, so the 404 at this route carries the competition title.

Server component, fully static. Adding an exhibition venue to the config requires also adding its image to the `venueImages` map (missing venues render an empty-src Image). The last venue centers itself when the count is odd. The Event schema's two ISO dates are the one place not derived from config — if the competition timeline changes, update the `startDate`/`endDate` constants here (they carry comments naming their timeline labels).

---
*Documented at commit bde729d.*
