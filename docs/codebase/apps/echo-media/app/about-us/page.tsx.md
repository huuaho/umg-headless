# apps/echo-media/app/about-us/page.tsx

**Purpose:** Static About Us page for Echo Media — mission, vision, core values, and a contact call-to-action.

## Responsibilities
Renders fully static, hard-coded marketing copy: an intro describing Echo Media as a community-centered media platform under United Media (youth voices, learning, community), followed by **Mission**, **Vision**, **Our Core Values** (six values: Curiosity, Clarity, Respect, Youth-Centered Thinking, Integrity, Access), a "Welcome to Echo Media" closing, and a dark "Contact Us" band with a `mailto:info@unitedmediadc.com` button.

## Key exports
- `AboutUsPage() -> JSX` — default export; the `/about-us` route.

## Dependencies
- Internal: none (pure JSX + Tailwind classes).
- External: `react` (implicit JSX).

## Used by
Next.js App Router — the `/about-us` route. Linked from the shared Footer navigation.

## Notes
- No data fetching, no client interactivity — statically exported at build time.
- Contact email here is `info@unitedmediadc.com`, while the Footer (set in `layout.tsx`) uses `unitedmediagroup196@gmail.com`.
- **Difference vs international-spectrum:** content only. The IS version is much shorter (four paragraphs about culture/lifestyle journalism, no Mission/Vision/Values headings) but uses the identical page structure and Contact Us band.
- The older `docs/about-us.md` describes the *UMG* about page (hero banner, platform cards, competition callout) — that doc does not apply to this much simpler page.

---
*Documented at commit 1cbdce5.*
