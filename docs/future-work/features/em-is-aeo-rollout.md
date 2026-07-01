# EM / IS AEO Rollout

> Port UMG's shipped site-level AEO/SEO work — Organization JSON-LD, OG/Twitter defaults, sitemap/robots, footer socials — to echo-media.info and internationalspectrum.org, after first extracting a shared `packages/ui/JsonLd` helper. Article-level `Article`/`NewsArticle` JSON-LD is explicitly **out of scope** here (tracked separately in `em-is-article-schema`).

## Scope

In scope: `packages/ui/JsonLd` extraction + UMG migration; then, per site (`apps/echo-media`, `apps/international-spectrum`):
1. Organization / `NewsMediaOrganization` JSON-LD in the root layout
2. OpenGraph + Twitter metadata defaults in the root layout (`metadataBase` already present)
3. `app/sitemap.ts` + `app/robots.ts` (adapted from UMG)
4. Footer `socials` prop + `rel="me"` (already supported in the shared Footer)

Out of scope: per-article `Article`/`NewsArticle` JSON-LD; GA4/Search Console; branded OG image *design* (asset creation is a decision/blocker, not dev).

## Repo reality snapshot (verified 2026-06-30)

- **UMG (DONE, the source of truth to copy):** `apps/umg/app/layout.tsx` emits `NewsMediaOrganization` JSON-LD inline via `<script type="application/ld+json" dangerouslySetInnerHTML>`, plus `metadataBase` + `openGraph` + `twitter` defaults; `apps/umg/app/sitemap.ts` and `apps/umg/app/robots.ts` are live; `<Footer socials={[...]} />` passes X + Instagram.
- **No shared JsonLd helper exists.** UMG hand-rolls the identical `<script type="application/ld+json" ...>` block in **4 files**: `apps/umg/app/layout.tsx`, `apps/umg/app/how-to-enter/page.tsx`, `apps/umg/app/about-us/page.tsx`, `apps/umg/app/contact/page.tsx`. `packages/ui/index.ts` exports no such component.
- **Footer already supports `rel="me"`** — `packages/ui/Footer.tsx` renders social anchors with `rel="me noopener noreferrer"` in **both** layout variants (mobile + desktop), and `socialIcons` supports exactly two platforms: `x` and `instagram`.
- **EM/IS layouts** (`apps/echo-media/app/layout.tsx`, `apps/international-spectrum/app/layout.tsx`) already set `metadataBase` + `title` + `description`, but have **no** `openGraph`/`twitter` blocks, **no** Organization JSON-LD, and render `<Footer>` **without** `socials`. Both currently pass `email="unitedmediagroup196@gmail.com"` to the Footer.
- **EM/IS routes** (identical shape): `/`, `/about-us`, `/category/[slug]`, `/articles/[slug]`, `/search`. No sitemap.ts/robots.ts on either site.
- **Category sources:** `apps/echo-media/lib/categories.ts` (3 categories), `apps/international-spectrum/lib/categories.ts` (7 categories).
- **Article slugs** are enumerable at build via `fetchAllSlugs()` from `@umg/api` — already used in each site's `app/articles/[slug]/page.tsx` `generateStaticParams()`.
- **Available brand assets:** `apps/{echo-media,international-spectrum}/public/images/banner/` contains `em-logo.svg`, `em-logo-black.png`, `is-logo.svg`, `is-logo-black.svg` (among others). **EM has a raster PNG** (`em-logo-black.png`); **IS has SVG only** — no raster logo, and neither site has an `og-image.jpg`.

## Brand-specific decisions needed (FLAG before shipping)

| Field | Echo Media | International Spectrum | Status |
|---|---|---|---|
| Canonical `description` | Layout has "Educational content, resources, and stories that inspire learning and personal development" | Layout has "Exploring the richness of global cultures, sharing stories that promote cross-cultural understanding" | Reuse existing layout copy unless brand wants a rewrite. Must match schema `description` + social bios (per UMG ticket 13 pattern). |
| Schema `logo` (prefers raster, on own domain) | `em-logo-black.png` exists → `https://echo-media.info/images/banner/em-logo-black.png` | **No raster logo** — only SVG | **DECISION:** IS needs a raster PNG logo, or accept `is-logo.svg` (Google Rich Results prefers raster). |
| Schema `email` | Only Gmail known (`unitedmediagroup196@gmail.com`) | Same Gmail | **DECISION:** UMG ticket 01 says *don't ship a Gmail address in schema*. Get a branded address per brand, or **omit `email`** from the Organization schema. |
| Social handles (`sameAs` + Footer `socials`) | **UNKNOWN** | **UNKNOWN** | **BLOCKER:** no EM/IS X/Instagram accounts are referenced anywhere in the repo. Footer only renders `x` + `instagram` icons. If handles don't exist, skip the Footer-socials step and the `sameAs` array (or leave `sameAs` empty) until brand provides them. |
| Twitter `site` handle | **UNKNOWN** | **UNKNOWN** | Same blocker — omit `twitter.site` until known. |
| Default OG image (1200×630) | None (article pages supply their own featured image) | None | **DECISION:** design a branded 1200×630 per site (mirror UMG ticket 09), or ship OG/Twitter defaults *without* a default image and rely on article-level images. |

Rule of thumb (from the AEO master-doc): the canonical `description` must be **the same sentence** in the layout metadata, the Organization schema, and the social bios.

---

## Step 0 — Extract shared `packages/ui/JsonLd` helper (do first)

This is the enabling refactor. It removes the `dangerouslySetInnerHTML` boilerplate from UMG's 4 hand-rolled call sites and gives EM/IS a clean primitive for the Organization schema.

**0.1** Create `packages/ui/JsonLd.tsx`:

```tsx
export default function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

Keep it deliberately dumb: it only serializes + renders. All schema-building logic stays in each app (facts are app-specific). API: a single `schema` object prop.

**0.2** Export it from `packages/ui/index.ts` alongside the other named exports:

```ts
export { default as JsonLd } from "./JsonLd";
```

**0.3** Migrate the 4 UMG call sites to `import { JsonLd } from "@umg/ui"` and replace each inline `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(X) }} />` with `<JsonLd schema={X} />`:
- `apps/umg/app/layout.tsx` (organization schema, ~line 95)
- `apps/umg/app/how-to-enter/page.tsx` (Event + FAQPage — two blocks)
- `apps/umg/app/about-us/page.tsx`
- `apps/umg/app/contact/page.tsx` (ContactPage)

**0.4** Verify: `pnpm turbo run build --filter=umg` succeeds; view-source / grep `out/index.html` for `application/ld+json` shows the same JSON as before (byte-identical output — the refactor is behavior-preserving). Re-run `validator.schema.org` on the homepage to confirm no regressions.

**Effort:** ~1 hr (component + export + 4 call-site swaps + build check).

---

## Step 1 — Echo Media (`apps/echo-media/`)

### 1a. Organization JSON-LD in `apps/echo-media/app/layout.tsx`
Mirror UMG's structure (verbatim shape, EM values). Add module-scoped constants and a schema object, then render `<JsonLd schema={organizationSchema} />` in the `<body>`:

```tsx
const SITE_URL = "https://echo-media.info";
const SITE_DESCRIPTION =
  "Educational content, resources, and stories that inspire learning and personal development";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: "Echo Media",
  url: SITE_URL,
  logo: `${SITE_URL}/images/banner/em-logo-black.png`, // raster exists
  description: SITE_DESCRIPTION,
  // email: OMIT until a branded address exists (no Gmail in schema)
  parentOrganization: {                 // optional but recommended: ties brand → UMG
    "@type": "NewsMediaOrganization",
    name: "United Media Group",
    url: "https://unitedmediadc.com",
  },
  sameAs: [],                           // fill once EM social handles are known
};
```
Import `JsonLd` from `@umg/ui`; add `<JsonLd schema={organizationSchema} />` at the top of `<body>` (same position as UMG).

### 1b. OG/Twitter defaults in the same `metadata` export
`metadataBase` is already set. Add `openGraph` + `twitter` blocks (adapt UMG lines 41–59). Use `SITE_URL`, EM name/description. Omit `twitter.site` until the handle is known; omit the default `images` array (or point at a branded 1200×630 once it exists — see decision table).

```tsx
openGraph: {
  title: "Echo Media",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  siteName: "Echo Media",
  locale: "en_US",
  type: "website",
  // images: [{ url: "/og-image.jpg", width: 1200, height: 630 }], // once designed
},
twitter: {
  card: "summary_large_image",
  title: "Echo Media",
  description: SITE_DESCRIPTION,
  // site: "@...", // once known
},
```

### 1c. `apps/echo-media/app/sitemap.ts`
Adapt UMG's, but EM's routes + async article enumeration. Static routes: `""`, `/about-us`, `/search`. Category routes from `apps/echo-media/lib/categories.ts`. Article routes via `fetchAllSlugs()` (build-time). Because articles need a fetch, make the sitemap `async`:

```ts
import type { MetadataRoute } from "next";
import { fetchAllSlugs } from "@umg/api";
import { categories } from "@/lib/categories";

export const dynamic = "force-static";
const BASE_URL = "https://echo-media.info";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "", changeFrequency: "daily" as const, priority: 1 },
    { path: "/about-us", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/search", changeFrequency: "monthly" as const, priority: 0.3 },
  ];
  const categoryRoutes = categories.map((c) => ({
    path: `/category/${c.slug}`, changeFrequency: "daily" as const, priority: 0.7,
  }));
  const slugs = await fetchAllSlugs();
  const articleRoutes = slugs.map((slug) => ({
    path: `/articles/${slug}`, changeFrequency: "weekly" as const, priority: 0.6,
  }));
  return [...staticRoutes, ...categoryRoutes, ...articleRoutes].map((r) => ({
    url: `${BASE_URL}${r.path}/`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
```
Keep UMG's trailing-slash convention. (UMG's own sitemap is sync + has no article routes because UMG links out and has no internal article pages — that's the one real adaptation here.)

### 1d. `apps/echo-media/app/robots.ts`
Near-verbatim copy of `apps/umg/app/robots.ts`; only change the sitemap URL to `https://echo-media.info/sitemap.xml`. Same AI-bot allow-list (`GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `CCBot`). (Same policy caveat as UMG ticket 11: this opts content INTO AI crawling — flag to Allison, though it matches UMG.)

### 1e. Footer socials in `apps/echo-media/app/layout.tsx`
**Only if EM handles exist.** Add the `socials` prop to `<Footer>` (the shared Footer already emits `rel="me noopener noreferrer"`):
```tsx
socials={[
  { platform: "x", url: "https://x.com/<em_handle>" },
  { platform: "instagram", url: "https://www.instagram.com/<em_handle>/" },
]}
```
Keep these URLs identical to the schema `sameAs` array (1a). If no handles exist yet, **skip this step** and leave `sameAs: []`.

---

## Step 2 — International Spectrum (`apps/international-spectrum/`)

Identical procedure to Step 1, with IS values. Only the differences are called out:

### 2a. Organization JSON-LD in `apps/international-spectrum/app/layout.tsx`
```tsx
const SITE_URL = "https://internationalspectrum.org";
const SITE_DESCRIPTION =
  "Exploring the richness of global cultures, sharing stories that promote cross-cultural understanding";
// name: "International Spectrum"
// logo: NO raster PNG exists — DECISION: add a PNG, or use `${SITE_URL}/images/banner/is-logo-black.svg`
// email: OMIT (no branded address)
// parentOrganization: United Media Group (as in 1a)
// sameAs: [] until handles known
```

### 2b. OG/Twitter defaults
Same as 1b with IS name/description/URL.

### 2c. `apps/international-spectrum/app/sitemap.ts`
Same async pattern as 1c; `BASE_URL = "https://internationalspectrum.org"`; categories from `apps/international-spectrum/lib/categories.ts` (7 of them); article routes via `fetchAllSlugs()`.

### 2d. `apps/international-spectrum/app/robots.ts`
Copy of UMG's; sitemap URL → `https://internationalspectrum.org/sitemap.xml`.

### 2e. Footer socials
Same as 1e — only if IS handles exist; otherwise skip and leave `sameAs: []`.

---

## Testing / validation (per site)

- **Build:** `pnpm turbo run build --filter=echo-media` and `--filter=international-spectrum` succeed; `out/sitemap.xml` and `out/robots.txt` are emitted, and `out/index.html` contains exactly one `application/ld+json` block.
- **JSON-LD:** paste the rendered schema into `https://validator.schema.org` → 0 errors, `NewsMediaOrganization` recognized. After deploy, run `search.google.com/test/rich-results` on the live homepage. Confirm the `logo` URL returns 200 and `sameAs` URLs (if any) return 200.
- **OG/Twitter:** view-source on `/` shows `og:title/description/url/type` + `twitter:card`. After deploy, re-scrape in the Facebook Sharing Debugger and X Card Validator; sanity-check a real paste in iMessage/Slack.
- **Sitemap/robots:** every sitemap URL returns 200 in production (`curl -o /dev/null -w "%{http_code}"` over the list); category URLs exactly match `lib/categories.ts` slugs; article URLs match `fetchAllSlugs()` output; `robots.txt` lists the AI user-agents + the correct sitemap line.
- **Footer socials (if shipped):** view-source shows both anchors with `rel="me noopener noreferrer"` (check both mobile + desktop render paths); `w3.org` HTML validator shows no rel-value warnings; `sameAs` URLs == footer URLs.

## Effort

| Item | Effort |
|---|---|
| Step 0 — shared `JsonLd` helper + UMG migration | ~1 hr |
| EM: Organization schema + OG/Twitter (1a/1b) | ~1 hr |
| EM: sitemap + robots (1c/1d) | ~45 min |
| EM: Footer socials (1e) | ~15 min (if handles exist) |
| IS: same set (2a–2e) | ~2 hrs total |
| Testing / validation both sites | ~1–2 hrs |

Roughly **~0.5–0.75 day per site** once Step 0 lands (down from ~1–1.5 day/site in the remaining-work estimate, because the shared helper + already-present `metadataBase`/article-level OG remove work).

## Recommended order

1. **Step 0** — shared `JsonLd` helper + UMG migration (unblocks/cheapens everything; behavior-preserving, low risk).
2. **Resolve the decision table** — get EM/IS canonical descriptions, a branded email (or decide to omit), an IS raster logo (or accept SVG), and social handles. The social handles are the one true blocker for steps 1e/2e and the `sameAs` arrays; everything else can ship without them.
3. **Echo Media (Step 1)** — schema + OG/Twitter first (1a/1b), then sitemap/robots (1c/1d), then Footer socials (1e) if handles landed. EM first because it has a raster logo and fewer categories (simpler validation).
4. **International Spectrum (Step 2)** — same order; resolve the IS logo decision before 2a.
5. Ship each site behind its own `deploy-*.yml`; validate live before moving on.

> Once these land, `em-is-article-schema` (Article/NewsArticle JSON-LD on `/articles/[slug]`) becomes a clean follow-up: it reuses this doc's `JsonLd` helper and pulls `publisher` from each site's Organization schema defined here.
