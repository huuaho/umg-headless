# apps/international-spectrum/next.config.ts

**Purpose:** Next.js config — static export in production, workspace package transpilation, and International Spectrum image domains.

## Responsibilities
Configures the app to: transpile the three workspace packages (`@umg/api`, `@umg/config`, `@umg/ui`) so their untranspiled TS/TSX can be imported directly; build as a fully static site (`output: "export"`) when `NODE_ENV === "production"` while keeping the normal dev server otherwise; emit `trailingSlash: true` URLs (`/about-us/` etc., needed for static-host directory layouts); and serve images unoptimized (required under `output: "export"`) with `remotePatterns` allowing `www.internationalspectrum.org`, `internationalspectrum.org`, and `api.internationalspectrum.org`.

## Key exports
- `nextConfig: NextConfig` — default export.

## Dependencies
- Internal: none
- External: `next` (types only)

## Used by
Next.js CLI (`next dev` / `next build`) via the app's [package.json](package.json.md) scripts.

## Notes
- Because images are `unoptimized`, `remotePatterns` mostly future-proofs `next/image` usage for content images hosted on the site's own WP backend (`api.internationalspectrum.org`).
- Banner logos are local, so `api.unitedmediadc.com` no longer needs whitelisting here.
- **Difference vs echo-media:** only the three hostnames — EM allows `www.echo-media.info`, `echo-media.info`, `api.echo-media.info`. Everything else is identical.

---
*Documented at commit 1cbdce5.*
