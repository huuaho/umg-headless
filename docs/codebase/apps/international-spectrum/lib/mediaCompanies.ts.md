# apps/international-spectrum/lib/mediaCompanies.ts

**Purpose:** Site config — the list of sibling United Media companies shown in the Header marquee banner and Footer.

## Responsibilities
Defines the `MediaCompany` shape and lists the two *other* United Media brands that International Spectrum cross-promotes: **United Media Group** and **Echo Media**. Each entry carries a name, one-line description, external URL, a color `logo` (used by the Header marquee) and a B&W `logoBW` (used by the Footer). All logo paths point at local assets in `public/images/banner/` (see [public/images/banner/README.md](../public/images/banner/README.md)).

## Key exports
- `MediaCompany` (interface) — `{ name, description, url, logo, logoBW }`.
- `mediaCompanies: MediaCompany[]` — the 2 partner brands in marquee order.

## Dependencies
- Internal: none (paths reference `public/` assets resolved at runtime).
- External: none

## Used by
[app/layout.tsx](../app/layout.tsx.md) — passed to `Header` as `bannerCompanies` and to `Footer` as `companies`.

## Notes
- Logos were previously loaded from WordPress uploads; they are now fully local, so no remote image domains are needed for the banner.
- The site's *own* logo (`is-logo.svg` / `is-logo-black.svg`) is not in this list — it's passed separately to Header/Footer in `layout.tsx`.
- **The marquee repeat count is tied to the company count.** `packages/ui/Header.tsx` repeats this list 8× inside the `animate-marquee` strip, and `@keyframes marquee` (globals.css) scrolls it to `translateX(-50%)` over 20s — so *half* the repeated strip must be at least as wide as the banner's inner width (`max-w-[1440px]` less `lg:px-8`, up to ~1376px), or a blank gap opens on the right and grows across each cycle. Going from 3 companies to 2 dropped this app's half-strip to ~1030px and broke the loop; the repeat was raised 4× → 8× (half-strip now ~2061px). Shortening the list again means re-checking that margin. The separate announcement-banner marquee lower in the same file is unaffected and still repeats 4×.
- **Difference vs echo-media:** each app lists UMG plus the remaining sibling — IS lists Echo Media (education-focused description, `www.echo-media.info`); EM lists International Spectrum instead. The UMG entry is identical in both.
- **Diplomatic Watch Magazine** (`diplomaticwatch.com`) was removed from all three sites at the client's request on 2026-10-01, along with its `dw-logo*` assets.

---
*Documented at commit 0c47b38.*
