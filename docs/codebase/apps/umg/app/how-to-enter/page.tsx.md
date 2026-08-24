# apps/umg/app/how-to-enter/page.tsx

**Purpose:** Photo-competition landing page — the full public brochure for "My Hometown, My Lens". **Currently showing an on-hold announcement** while the competition is postponed; the full brochure is intact behind a flag.

## Responsibilities
A module-level `COMPETITION_ON_HOLD = true` flag (added 2026-08-23, replacing the earlier `notFound()` guard) switches the route between two modes:

- **On hold (current):** renders the hero banner plus a "Competition Update" section — competition temporarily on hold while scholarship opportunities are developed, all current applicants processed for a full refund, contact `mailto:info@unitedmediadc.com`. The `metadata` export is likewise conditional ("My Hometown My Lens Competition Update" title/description), and the Event/FAQ JSON-LD scripts do **not** render in this mode, so search engines don't see the competition advertised as open.
- **Restored (`COMPETITION_ON_HOLD = false`):** everything described below returns, including the original competition metadata.

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
- `default HowToEnterPage() -> JSX` — the `/how-to-enter` route; on-hold announcement now, Event + FAQPage JSON-LD brochure when restored.
- `metadata` — conditional on the flag: on-hold update title/description now, competition title + description when restored.

## Dependencies
- Internal: [lib/competitions/current](../../lib/competitions/current.ts.md), [lib/competitions/judges](../../lib/competitions/judges.tsx.md), [components/CompetitionDivisions](../../components/CompetitionDivisions.tsx.md), [components/PhotoRequirements](../../components/PhotoRequirements.tsx.md), [components/CompetitionRules](../../components/CompetitionRules.tsx.md), [components/HostingCommittees](../../components/HostingCommittees.tsx.md)
- External: `next/image`, `next/link`

## Used by
App Router — route `/how-to-enter`. The Header `announcementBanner` in [app/layout.tsx](../layout.tsx.md) ("My Hometown My Lens Competition Update") links here again as of 2026-08-23, and the route is back in [sitemap.ts](../sitemap.ts.md). The competition-era inbound links (extra nav link, about-us promo section, submission-form links) remain commented out.

## Notes
**Competition postponed indefinitely (client request, 2026-08-13; announcement added 2026-08-23):** set `COMPETITION_ON_HOLD = false` to restore the full page, then uncomment the layout nav link, original announcement banner, and about-us section (grep "Competition postponed indefinitely"). Other competition routes (`/photo-submission`, `/judges-panel`, `/school-registration`) still 404 via their own `notFound()` guards.

Server component, fully static. Adding an exhibition venue to the config requires also adding its image to the `venueImages` map (missing venues render an empty-src Image). The last venue centers itself when the count is odd. The Event schema's two ISO dates are the one place not derived from config — if the competition timeline changes, update the `startDate`/`endDate` constants here (they carry comments naming their timeline labels).

---
*Documented at commit b9a61ff.*
