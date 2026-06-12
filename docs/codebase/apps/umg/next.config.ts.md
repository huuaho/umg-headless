# apps/umg/next.config.ts

**Purpose:** Next.js configuration — static export build with unoptimized images.

## Responsibilities
Configures the app as a fully static site (`output: "export"`, `trailingSlash: true`) so it can be hosted without a Node server alongside the headless WordPress backend. Transpiles the three workspace packages and disables Next image optimization (required for static export), while allowlisting remote image hosts.

## Key exports
- `default: NextConfig` — the config object.

## Dependencies
- Internal: none (references `@umg/api`, `@umg/config`, `@umg/ui` by name in `transpilePackages`)
- External: `next` (types only)

## Used by
Next.js CLI (`next dev` / `next build`).

## Notes
- `images.unoptimized: true` — every `next/image` renders as a plain `<img>`; the eslint config also disables `no-img-element` for the same reason.
- Allowed remote image hosts: picsum.photos, diplomaticwatch.com (+www), www.echo-media.info, www.internationalspectrum.org, unitedmediadc.com (+www).
- Static export means all routes must be pre-renderable; the category route pins this with `dynamicParams = false` (see [app/category/[slug]/page.tsx](app/category/[slug]/page.tsx.md)).

---
*Documented at commit 1cbdce5.*
