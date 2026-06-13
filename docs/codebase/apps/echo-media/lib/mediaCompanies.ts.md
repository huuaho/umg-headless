# apps/echo-media/lib/mediaCompanies.ts

**Purpose:** Site config — the list of sibling United Media companies shown in the Header marquee banner and Footer.

## Responsibilities
Defines the `MediaCompany` shape and lists the three *other* United Media brands that Echo Media cross-promotes: **United Media Group**, **International Spectrum Media**, and **Diplomatic Watch Magazine**. Each entry carries a name, one-line description, external URL, a color `logo` (used by the Header marquee) and a B&W `logoBW` (used by the Footer). All logo paths point at local assets in `public/images/banner/` (see [public/images/banner/README.md](../public/images/banner/README.md)).

## Key exports
- `MediaCompany` (interface) — `{ name, description, url, logo, logoBW }`.
- `mediaCompanies: MediaCompany[]` — the 3 partner brands in marquee order.

## Dependencies
- Internal: none (paths reference `public/` assets resolved at runtime).
- External: none

## Used by
[app/layout.tsx](../app/layout.tsx.md) — passed to `Header` as `bannerCompanies` and to `Footer` as `companies`.

## Notes
- Logos were previously loaded from WordPress uploads; they are now fully local, so no remote image domains are needed for the banner.
- The site's *own* logo (`em-logo.svg` / `em-logo-black.png`) is not in this list — it's passed separately to Header/Footer in `layout.tsx`.
- **Difference vs international-spectrum:** each app lists the other two siblings plus UMG — Echo Media lists International Spectrum; IS lists Echo Media instead (with an education-focused description). UMG and Diplomatic Watch entries are identical in both.

---
*Documented at commit 1cbdce5.*
