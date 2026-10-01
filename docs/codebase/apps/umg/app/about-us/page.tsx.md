# apps/umg/app/about-us/page.tsx

**Purpose:** Static "About Us" page describing UMG, its two media platforms, values, partners, and contact info.

## Responsibilities
AEO-optimized structure (the H1 is the entity name, not the tagline): hero banner with `<h1>About United Media Group</h1>` followed by "Diplomacy. Culture. Community." as a styled subtitle. The "Who We Are" lead paragraph opens with the canonical mission sentence ("United Media Group is Washington DC's multicultural media organization, covering diplomatic affairs, community stories, and international perspectives through Echo Media and International Spectrum.") — verbatim match with the Organization schema in [layout.tsx](../layout.tsx.md). The pillar cards (two since 2026-10-01: Echo Media, International Spectrum) are `<h2>` headings (one per pillar), each description opening with a definitional sentence. Remaining sections: What Drives Us (local `values`), Our Partners ([HostingCommittees](../../components/HostingCommittees.tsx.md)), an FAQ section, and Connect With Us (email info@unitedmediadc.com, Instagram, X). The former Section 4 — the "My Hometown, My Lens" competition promo box linking to `/how-to-enter` — is commented out in the JSX (see Notes).

Emits a `FAQPage` JSON-LD `<script>` whose `mainEntity` is generated from the same local `faqs` array that renders the visible FAQ (3 org Q&As — single source, so visible text and schema can't drift). A page-level `metadata` export sets the title "About United Media Group" and the canonical-sentence description.

## Key exports
- `default AboutUsPage() -> JSX` — the `/about-us` route; renders the FAQPage JSON-LD.
- `metadata` — title + canonical-description.

## Dependencies
- Internal: [components/HostingCommittees](../../components/HostingCommittees.tsx.md)
- External: none at present (`next/link` import is commented out alongside the competition section)

## Used by
App Router — route `/about-us` (linked from Header/Footer nav in `@umg/ui`).

## Notes
Copy is hardcoded in local const arrays (`platforms`, `values`, `faqs`); no CMS dependency. **Diplomatic Watch removed (client request, 2026-10-01):** its `platforms` entry was deleted outright (not commented out) and every mention of it was dropped from the `metadata` description, the "Who We Are" lead, and the "What does United Media Group cover?" FAQ answer, which now says "two pillars". Because the visible FAQ and the `FAQPage` schema both read from `faqs`, that answer only had to change in one place. The matching `--color-dw`/`--color-dw-tagline` variables were removed from [globals.css](../globals.css.md), so no leftover pillar can reference them. The "Our Platforms" grid had to follow the array length too: it stayed on `md:grid-cols-3` after the card was deleted, leaving the two survivors in columns 1 and 2 with an empty third, and was corrected to `md:grid-cols-2` in `11f39b4`. **Worth remembering if a pillar is ever added or removed again** — nothing fails, the layout just quietly goes lopsided. **Competition postponed indefinitely (client request, 2026-08-13):** the whole "My Hometown, My Lens" section (and its `next/link` import) is commented out, not deleted — search the repo for "Competition postponed indefinitely" to find every hidden piece and uncomment it to restore. The commented blurb (ages 10–30, Library of Congress / Smithsonian, $8,000 First Prize) duplicates facts from [lib/competitions/current.ts](../../lib/competitions/current.ts.md) — re-check them when restoring. The mission sentence, the layout Organization schema, and the social bios should all use the same canonical wording.

---
*Documented at commit 11f39b4.*
