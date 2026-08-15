# apps/umg/lib/competitions/current.ts

**Purpose:** The active competition's configuration — all content for "My Hometown, My Lens" 2026.

## Responsibilities
Exports one fully populated `Competition` object (`id: "2026-youth-photography"`, `status: "open"`) that drives the how-to-enter page, division/requirements components, and the submission form:

- Theme intro + 3 description paragraphs; 5-step timeline (open Mar 16 2026 → deadline **Oct 31, 2026** → jury review Nov 1–Dec 15 → winners Dec 16 → exhibitions Jan–May 2027; deadline extended from Aug 31 by client request).
- Two divisions: `youth` (ages 10–18, 100-word descriptions, bio optional) and `young-adults` (19–30, 200 words, bio required); both $50 entry fee, max 3 photos, with per-division requirement lists.
- Awards: $8,000 / $4,000 / $2,000 / $500 honorable mention (per-division recipient counts).
- 5 exhibition venues (Library of Congress, Smithsonian, Press Club, Georgetown, Johns Hopkins) + note.
- Photo rules: JPEG/JPG, RGB, ≤ 20 MB, ≥ 2,000 px, camera/tablet/smartphone.
- Legal statement strings (AI policy, originality, subject consent, rights/non-refundable fee) used verbatim as consent-checkbox labels.
- 6 evaluation criteria and per-division judging notes.
- `stripePaymentLink` — the live Stripe payment-link URL for the $50 fee.
- `personalInfoFields` list.

## Key exports
- `currentCompetition: Competition`

## Dependencies
- Internal: [types](types.ts.md)
- External: none

## Used by
[app/how-to-enter/page.tsx](../../app/how-to-enter/page.tsx.md), [components/CompetitionDivisions](../../components/CompetitionDivisions.tsx.md), [components/DivisionCard](../../components/DivisionCard.tsx.md), [components/PhotoRequirements](../../components/PhotoRequirements.tsx.md), [SubmissionForm](../../app/photo-submission/components/SubmissionForm.tsx.md).

## Notes
Content-only edits (dates, fees, copy) happen here and rebuild statically. Note the `status: "open"` field is *not* what hides the competition — as of 2026-08-13 the competition pages are hidden via `notFound()` guards in the page files themselves (grep "Competition postponed indefinitely"); this config is unchanged. The Event JSON-LD `endDate` in [how-to-enter/page.tsx](../../app/how-to-enter/page.tsx.md) is a hardcoded `2027-03-31` and was not updated with the timeline shift — reconcile when the page is restored. Caveats: division `entryFee` must match the Stripe payment link's amount and the plugin's expectations ([includes/payment.php](../../../../plugin/umg-photo-contest/includes/payment.php.md)); photo limits must match server-side enforcement ([includes/draft.php](../../../../plugin/umg-photo-contest/includes/draft.php.md)); exhibition venues need matching images in `public/images/venues/` (mapped in the how-to-enter page).

---
*Documented at commit bde729d.*
