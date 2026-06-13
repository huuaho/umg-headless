# packages/ui/Footer.tsx

**Purpose:** Shared site footer — big centered logo, optional newsletter signup, sibling-media B&W logos, alphabetical category links in two columns, and meta links (About, Contact, socials, copyright).

## Responsibilities
- Row 1: large centered logo linking home.
- Optional newsletter row: when `apiBaseUrl` is provided, renders [NewsletterSignup](NewsletterSignup.tsx.md) (posts to the WP `umg/v1/subscribe` endpoint).
- Content row, desktop (lg+): 4 columns with vertical dividers — company B&W logos (`logoBW`), categories left half, categories right half, meta column. Below lg: three centered stacked rows.
- Sorts `categories` alphabetically and splits at the midpoint into the two columns; links go to homepage hash sections (`/#slug`).
- Optional `socials` prop renders inline-SVG icons (built-ins: `x`, `instagram`) as external links with `rel="me noopener noreferrer"` — the `me` value asserts profile ownership to crawlers (part of the AEO entity-verification chain).
- "Contact Us" links to `mailto:${email}` by default, or to the optional `contactHref` path when provided (UMG passes `/contact`).
- Footer background themeable via the `--footer-bg` CSS variable.

## Key exports
- `Footer({ logoUrl, logoAlt, categories, companies, email, copyright, socials?, apiBaseUrl?, contactHref? })` (default) — the footer component.
- `FooterProps` — props type (`NavCategory`/`BannerCompany` are imported from [Header.tsx](Header.tsx.md)).

## Dependencies
- Internal: [Header.tsx](Header.tsx.md) (types only), [NewsletterSignup.tsx](NewsletterSignup.tsx.md)
- External: `next/link`

## Used by
- All three apps' `app/layout.tsx`. UMG passes `socials`, `apiBaseUrl`, and `contactHref="/contact"`; EM/IS currently pass none of these (newsletter, social icons, and the contact route are opt-in per app — EM/IS keep the default `mailto:` Contact behavior).

## Notes
- Server-compatible component (no `"use client"`); only the embedded NewsletterSignup is a client component.
- A social platform without a matching key in the built-in icon map renders an empty link — add the SVG to `socialIcons` when introducing new platforms.
- The newsletter endpoint is served by the **umg-newsletter** WP plugin — see [../../plugin/umg-newsletter/umg-newsletter.php.md](../../plugin/umg-newsletter/umg-newsletter.php.md).
- `rel="me"` composes with `noopener noreferrer` (space-separated). Both footer layout variants (lg+ and below-lg) carry it, so it appears 4× per rendered page when two socials are passed.

---
*Documented at commit 60deaa3.*
