# apps/international-spectrum/app/about-us/page.tsx

**Purpose:** Static About Us page for International Spectrum — culture/lifestyle positioning copy and a contact call-to-action.

## Responsibilities
Renders fully static, hard-coded marketing copy: four bold-styled paragraphs describing International Spectrum as a culture-and-lifestyle media platform under United Media (cultural identities, global aesthetics, "culture is not a backdrop — it is the story", heritage-meets-modernity), followed by a dark "Contact Us" band with a `mailto:info@unitedmediadc.com` button.

## Key exports
- `AboutUsPage() -> JSX` — default export; the `/about-us` route.

## Dependencies
- Internal: none (pure JSX + Tailwind classes).
- External: `react` (implicit JSX).

## Used by
Next.js App Router — the `/about-us` route. Linked from the shared Footer navigation.

## Notes
- No data fetching, no client interactivity — statically exported at build time.
- All body paragraphs use `font-semibold`, unlike Echo Media's regular-weight copy.
- Contact email here is `info@unitedmediadc.com`, while the Footer (set in `layout.tsx`) uses `unitedmediagroup196@gmail.com`.
- **Difference vs echo-media:** content only. The EM version is longer with Mission/Vision/Core Values sections; IS is a compact four-paragraph statement. Page structure and the Contact Us band are identical.

---
*Documented at commit 1cbdce5.*
