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
- Allowed remote image hosts: picsum.photos, www.echo-media.info, www.internationalspectrum.org, img.youtube.com (YouTube thumbnails used as featured images on Video Interviews cards, set by the ingestor), unitedmediadc.com (+www). The `diplomaticwatch.com` (+www) entries were removed in `12bef08`, after the DW articles were purged — they outlived the rest of the DW removal because dropping them earlier would have broken featured images on all 2,597 of them.
- **`remotePatterns` is effectively decorative here.** The hosts actually serving every article image — `api.echo-media.info` and `api.internationalspectrum.org` — are *not* in the list, and nothing breaks, because `unoptimized: true` makes `next/image` skip remote-pattern validation entirely. Worth knowing before trusting this list as an allowlist or "fixing" it.
- Static export means all routes must be pre-renderable; the category route pins this with `dynamicParams = false` (see [app/category/[slug]/page.tsx](app/category/[slug]/page.tsx.md)).

---
*Documented at commit 5f27b41.*
