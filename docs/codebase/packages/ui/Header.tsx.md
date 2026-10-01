# packages/ui/Header.tsx

**Purpose:** Shared sticky site header — responsive category navigation, expandable search, mobile menu, scrolling company-logo marquee, and an optional announcement banner.

## Responsibilities
- Renders a sticky (`top-0 z-50`) white header with the site logo (centered on mobile, left on desktop) linking home.
- Splits the `categories` prop responsively: first 2 always visible (md+), categories 3–4 visible at lg+ (moved into the "More" dropdown below lg), 5+ always in "More". `extraLinks` append to the dropdown and mobile menu.
- Category links use hash navigation (`/#slug`): on the homepage it intercepts the click for smooth `scrollIntoView`; on other pages it lets Next.js navigate to `/#slug`. A pathname effect scrolls to top on route change, or to the hash target on the homepage.
- Desktop search expands inline (auto-focused input, 50% width); mobile search lives in the full-screen menu. Both submit to `/search?search={query}`. Search UI is hidden on `/search`.
- Mobile hamburger toggles a full-screen menu (positioned below header + marquee, offset further when `announcementBanner` is present) with search, a 2-column category grid, About Us, and `extraLinks`.
- Renders a marquee of `bannerCompanies` color logos (repeated 8x for a seamless `animate-marquee` loop), each an external `target="_blank"` link.
- Optional `announcementBanner` renders a second scrolling text strip (gradient background) linking to `href` — used by UMG for the photo competition.

## Key exports
- `Header({ logoUrl, logoAlt, categories, bannerCompanies, extraLinks?, announcementBanner? })` (default) — the header component.
- `HeaderProps`, `NavCategory { name, slug }`, `BannerCompany { name, url, logo, logoBW }` — types reused by [Footer](Footer.tsx.md) and app config files.

## Dependencies
- Internal: none within `packages/ui` (icons are inline SVGs)
- External: `react`, `next/link`, `next/navigation` (`usePathname`, `useRouter`)

## Used by
- All three apps' `app/layout.tsx` (UMG, Echo Media, International Spectrum), each passing its own logo, categories from app config, and `bannerCompanies` from `lib/mediaCompanies.ts` (local assets under `public/images/banner/`).

## Notes
- `"use client"` component with window/document access (scroll, hash, resize-free).
- Border color is themeable via the `--banner-border-color` CSS variable (defaults to `#d1d5db`).
- **The banner repeat count is coupled to the company count.** `@keyframes marquee` translates the
  strip `translateX(0)` → `translateX(-50%)`, so *half* the repeated strip must be at least as wide
  as the banner's inner width (`max-w-[1440px]` less `lg:px-8` padding ≈ 1376px) or a blank gap
  opens on the right and grows across each 20s cycle. Dropping Diplomatic Watch took every banner
  from 3 logos to 2, which cut the half-strip to ~842px (UMG) / ~1058px (EM) / ~1030px (IS) and
  broke it; the repeat went 4x → 8x (~1685/2116/2061px) in `64980e0`. Shortening `bannerCompanies`
  again means re-checking that margin.
- The `announcementBanner` strip is a separate element with its own repeat count (still 4x) — it
  repeats a text span, not the company list, so it is unaffected by `bannerCompanies`.
- The "More" dropdown closes on blur with a 150 ms delay so item clicks register.
- Logos use plain `<img>`, not `next/image`.

---
*Documented at commit 64980e0.*
