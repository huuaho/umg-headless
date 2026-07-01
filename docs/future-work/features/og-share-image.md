# OG / Social Share Image (UMG)

> Upgrade the UMG homepage social-share preview from the interim venue photo to a branded 1200×630 share image — via a static designed asset (needs a designer) or a code-only Next.js dynamic `opengraph-image` (no designer). Maps to AEO ticket 09.

## Overview

When the UMG homepage URL is pasted into Facebook, X/Twitter, iMessage, Slack, Discord, LinkedIn, etc., the platform's scraper reads the page's OpenGraph / Twitter `<meta>` tags and renders a preview card. Ticket 09 asks for a **branded** image behind that card.

## Current state — already functional (this is an upgrade, not a fix)

`apps/umg/app/layout.tsx` already ships valid OG + Twitter metadata for every page:

- `openGraph.images` → `/images/venues/library-of-congress.jpg` (1920×1280) — line ~48
- `twitter.card` → `summary_large_image`, `twitter.images` → same venue photo — lines ~52–59
- `metadataBase` is set to `https://unitedmediadc.com`, so the relative image path resolves to an absolute URL for scrapers.

So previews **already render** with a real photo — the ticket's original "`/og-image.jpg` doesn't exist / is broken" framing is stale (confirmed in `docs/future-work/remediation/aeo-remaining-work.md`). What is missing is only **brand quality**: the current image is a generic venue photo with no logo, org name, or tagline. Nothing is broken and nothing is blocking; this is a purely cosmetic/quality upgrade.

Relevant facts:
- Site is a **static export** (`output: "export"`, `trailingSlash: true`, `images.unoptimized: true` in `apps/umg/next.config.ts`). This matters for the dynamic option below.
- Next.js version: **16.2.7** (supports `opengraph-image` file convention + `ImageResponse`).
- Assets live under `apps/umg/public/` (e.g. `public/images/venues/`, `public/umg-logo.png`, `public/umg-logo.svg`).

## The decision (Decision 4 / Q4)

| | Option A — Static designed asset | Option B — Dynamic `opengraph-image` |
|---|---|---|
| Who | Designer produces the artwork | Developer only, no designer |
| Blocked on | **Yes** — waiting on a designer (Q4) | **No** — code-only, ship today |
| Artifact | `public/og-image.jpg` (hand-designed) | `app/opengraph-image.tsx` (generated PNG) |
| Visual ceiling | High — full art direction, photography | Medium — logo + text + solid/gradient background |
| Iteration | New export each change | Edit code, rebuild |
| Static-export fit | Trivial (plain file) | Works — generated to a static PNG at build time |

Both produce a 1200×630 card. They are **mutually compatible**: you can ship B now and swap in A later (a static `public/og-image.jpg` / per-page override wins over the generated route if you point metadata at it).

---

## Option A — Static designed asset (needs designer; blocked on Decision 4)

1. **Design brief to the designer.** 1200×630 px, JPEG (or PNG), `<300KB` (fetched by every preview scraper). "UMG bold white headline-over-photo brand style" per spec: org name **United Media Group** + tagline **"Washington DC's Multicultural Media Voice"**. Must stay legible when previews downscale to ~400–500px wide (large type, high contrast, safe margins — keep text out of the outer ~5% in case of platform cropping).
2. **Add the asset** at `apps/umg/public/og-image.jpg`. (Because of static export it is served verbatim at `https://unitedmediadc.com/og-image.jpg`.)
3. **Repoint root metadata** in `apps/umg/app/layout.tsx`:
   - `openGraph.images` → `[{ url: "/og-image.jpg", width: 1200, height: 630 }]` (currently the venue photo at 1920×1280, line ~48).
   - `twitter.images` → `["/og-image.jpg"]` (line ~58).
   - Remove the "Interim image until the designed 1200x630 OG asset lands (ticket 09)" comment on line ~47.
4. **(Optional) Per-page overrides.** For high-value pages, export a `Metadata` (via `generateMetadata` or a static `metadata` object) that sets `openGraph.images` / `twitter.images` to a page-specific asset:
   - `apps/umg/app/how-to-enter/page.tsx` → competition card with prize + deadline (pull live values from `apps/umg/lib/competitions/current.ts`, don't hardcode — the config is the source of truth).
   - `apps/umg/app/about-us/page.tsx` → about/brand card.
   Place these at e.g. `public/images/og/how-to-enter.jpg`, `public/images/og/about-us.jpg`.
5. **Build + verify** the asset lands in `out/` after `pnpm build:umg` (or the repo's build script), then run the tests below.

**Effort:** ~2 hrs total, mostly designer; the dev repoint is ~15 min.

---

## Option B — Dynamic `opengraph-image` generation (code-only, no designer)

Next.js renders a special `opengraph-image` file per route into an image and auto-injects the correct `og:image` / `twitter:image` tags (with dimensions and type) — no manual metadata edit needed for that route. Under `output: "export"`, a **static** `opengraph-image` route (no dynamic segments) is rendered to a real PNG at build time, so it is fully compatible with this site.

1. **Create** `apps/umg/app/opengraph-image.tsx` exporting `size = { width: 1200, height: 630 }`, `contentType = "image/png"`, `alt`, and a default async component that returns an `ImageResponse` (`import { ImageResponse } from "next/og"`). Compose JSX: brand background (solid UMG color or gradient), org name, and tagline "Washington DC's Multicultural Media Voice".
2. **Fonts:** for reliable rendering, `fetch` a font `.otf/.ttf` as an `ArrayBuffer` and pass it in `ImageResponse`'s `fonts` option. The repo already bundles `apps/umg/fonts/ABCArizonaSans-Medium-Trial.otf` — read it from disk at build time (e.g. via `fs.readFileSync` / `import` of the font bytes) to match on-site branding. Falling back to a system/Google font is acceptable for a first pass.
3. **Logo:** embed `public/umg-logo.png` (raster — `ImageResponse`/Satori does **not** rasterize SVG `<img>` reliably, so prefer the `.png` over `.svg`) as a base64 data URI or inline it as SVG-as-JSX.
4. **Remove the manual homepage image** from `apps/umg/app/layout.tsx` (`openGraph.images` / `twitter.images`) so the generated route is the single source — OR leave metadata as-is and let the file convention override. Keep `twitter.card: "summary_large_image"`.
5. **(Optional) Per-page cards:** add `apps/umg/app/how-to-enter/opengraph-image.tsx` (and others) reading live values from `lib/competitions/current.ts` for prize/deadline. These are static routes → still build-time PNGs.
6. **Build + verify** the generated `opengraph-image.png` appears in `out/` and the emitted HTML `<meta property="og:image">` points at it.

**Note / risk:** `ImageResponse` runs on the edge runtime during dev/SSR, but for static export it must resolve at build time. Validate an actual `pnpm build:umg` early — confirm the PNG is emitted into `out/` (this is the one thing to de-risk with Option B).

**Effort:** ~2–4 hrs dev (mostly font/logo/layout fiddling), zero designer time.

---

## Recommendation

**Ship Option B now, keep Option A as a later polish.** Option B is code-only and unblocks 09 immediately (it is currently sitting at "blocked on designer" purely because Option A was assumed). A clean logo-plus-tagline generated card is already a clear brand upgrade over an unlabeled venue photo, and it gives per-page cards (competition prize/deadline) almost for free. If/when a designer delivers hero artwork, drop in `public/og-image.jpg` (Option A step 3) — it supersedes the generated route with a one-line metadata change. Do **not** block the upgrade on Decision 4.

## Testing

1. **Dimensions/size/200:** the resolved image URL returns `200`, is exactly `1200×630`, and (static option) `<300KB`.
2. **Facebook Sharing Debugger** (`developers.facebook.com/tools/debug/`): paste `https://unitedmediadc.com/`, click **Scrape Again** to bust FB's cache, confirm the new card.
3. **X/Twitter:** validate `summary_large_image` renders the image (Twitter's own validator is deprecated — use the FB debugger + a real paste into a draft post/DM).
4. **LinkedIn Post Inspector** (`linkedin.com/post-inspector/`): re-scrape, confirm the card.
5. **Real-world spot check:** paste the homepage URL into iMessage, Slack, and Discord — all should show the card. Scrapers cache aggressively, so re-scrape via each debugger after deploy.
6. **Legibility:** eyeball the image displayed at ~400px wide — org name + tagline must be readable.
7. **Per-page (if added):** repeat the debugger check for `/how-to-enter` and `/about-us`.
8. **Static export sanity:** after build, confirm the asset/PNG exists in `apps/umg/out/` and the built HTML's `og:image`/`twitter:image` resolve to absolute `https://unitedmediadc.com/...` URLs.

## Effort summary

- Option A: ~2 hrs (designer + ~15 min dev repoint). Blocked on Q4.
- Option B: ~2–4 hrs dev, unblocked, ships now. **Recommended.**
