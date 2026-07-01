# AEO / SEO Remaining Work

> Execution guide for the open (not-yet-shipped) AEO/SEO/content items tracked under `claude-context/current-work/`. Sprint 1 and most of Sprint 2 are done (`x-`-prefixed tickets); this doc covers only what is still open, verified against the repo on 2026-06-30.

## Repo reality check (what is already true today)

Verified in the code so the plan below builds on facts, not the tickets' original assumptions:

- **UMG Organization JSON-LD** ships inline in `apps/umg/app/layout.tsx` (`<script type="application/ld+json" dangerouslySetInnerHTML>`, `NewsMediaOrganization`).
- **UMG Event + FAQPage JSON-LD** ship inline in `apps/umg/app/how-to-enter/page.tsx`; **ContactPage** in `apps/umg/app/contact/page.tsx`; about-page schema in `apps/umg/app/about-us/page.tsx`. Four files each hand-roll the same inline `<script>` block — **there is no shared `JsonLd` helper** in `packages/ui` (confirmed: `packages/ui/index.ts` exports no such component).
- **UMG sitemap + robots are already live** — `apps/umg/app/sitemap.ts` and `apps/umg/app/robots.ts` exist (robots explicitly allows GPTBot/PerplexityBot/ClaudeBot/Google-Extended/CCBot and points at `sitemap.xml`). This means ticket 10's blocker ("do sitemap first") is **already satisfied** — 10 is unblocked on the code side and only waits on the Google account (Q3).
- **UMG OG image**: `apps/umg/app/layout.tsx` currently points OG/Twitter images at `/images/venues/library-of-congress.jpg` (1920×1280), **not** at a missing `/og-image.jpg`. Ticket 09's context line is slightly stale — nothing is broken; 09 is purely an asset-quality upgrade.
- **EM/IS article pages exist** — `apps/echo-media/app/articles/[slug]/page.tsx` and `apps/international-spectrum/app/articles/[slug]/page.tsx`, both with `generateMetadata` already emitting **article-level OpenGraph + Twitter** tags. So the EM/IS rollout's per-article metadata is **partly done**; what is missing there is JSON-LD, Organization schema, sitemap/robots, and footer socials.
- **EM/IS layouts** (`apps/{echo-media,international-spectrum}/app/layout.tsx`) already set `metadataBase` + title + description, but have **no** OpenGraph/Twitter defaults, **no** Organization JSON-LD, and their `<Footer>` is rendered **without** the `socials` prop.
- **Article data shape** (`packages/api/types.ts` `ApiArticle`) exposes `title, slug, date, author_name, excerpt, featured_image, images[], category, read_time_minutes`. Enough for `NewsArticle`/`Article` schema. Note: there is **no `modified`/`dateModified` field** — schema `dateModified` would have to reuse `date` or the plugin would need to add it.
- EM/IS consume standard `wp/v2/posts` ("wp" mode). Only UMG consumes the **united-media-ingestor** custom feed (`um/v1/articles`), and UMG's article cards link **out** to source sites (`slug` is cleared, see `packages/api/client.ts`) — UMG has no internal article pages.

**Standing rule (from master-doc):** wherever the spec's sample values conflict with `apps/umg/lib/competitions/current.ts`, the config wins.

---

## Open items

### 09 — Branded OG image asset
**What / status:** Ship a designed 1200×630 branded share image at `apps/umg/public/og-image.jpg` and repoint metadata to it. Status: **not started — blocked on a designer (Decision 4 / Q4).** Not urgent: the interim venue photo already renders valid previews.

**Approach:**
1. Designer delivers 1200×630 JPEG, <300KB, org name + tagline, legible at ~400px wide.
2. Place at `apps/umg/public/og-image.jpg`.
3. In `apps/umg/app/layout.tsx`, change the two image references (currently `/images/venues/library-of-congress.jpg` on lines ~48 and ~58) to `/og-image.jpg` with `width: 1200, height: 630`.
4. Optional: page-specific images for `/how-to-enter` (prize/deadline branding) and `/about-us`.
5. Validate: URL returns 200 at correct dimensions; re-scrape in Facebook Sharing Debugger + X Card Validator; real-world paste in iMessage/Slack.

**Dependencies / decisions:** Blocked on designer (Q4). No code dependency otherwise.
**Effort:** ~2 hrs (mostly designer; dev repoint is ~15 min).

---

### 10 — Google Analytics 4 + Search Console
**What / status:** Add GA4 to UMG and verify + submit the sitemap in Search Console. Status: **not started.** The ticket's stated blocker (sitemap first) is **already resolved** — `sitemap.ts`/`robots.ts` are live. Real remaining blocker: **Google account ownership (Q3).**

**Approach:**
1. Client provides / creates the owning Google account (the `info@` alias can create one) — coordinate with Allison.
2. Create GA4 property; get the measurement ID.
3. Add the GA4 tag in `apps/umg/app/layout.tsx` via `next/script` (`strategy="afterInteractive"`), reading `process.env.NEXT_PUBLIC_GA_ID`. Guard so it only renders in production / when the env var is present (keeps `pnpm dev:umg` clean).
4. Wire the env var: `.env.local` for local, GitHub secret → `deploy-umg.yml` build env (mirror the existing `NEXT_PUBLIC_WP_API_URL` wiring). Keep it UMG-only so EM/IS are unaffected.
5. Search Console: verify the domain property (DNS TXT via SiteGround, covers www + non-www), submit `https://unitedmediadc.com/sitemap.xml`.
6. Document the spec §9 monitoring cadence at the bottom of the ticket once live (monthly "Who is United Media Group?" tests on ChatGPT/Perplexity/Google; GSC crawl stats for GPTBot; referral traffic from chatgpt.com/perplexity.ai).

**Dependencies / decisions:** Blocked on Q3 (Google account). Sitemap prerequisite already met.
**Effort:** ~1 hr dev once the account exists (+ external DNS/GSC setup time).

---

### 12 — Content formatting standards (editorial, ongoing)
**What / status:** Adopt the 7 spec editorial rules (one descriptive H1/page; declarative opening sentence; full named entities on first reference; explicit "Washington DC"; absolute dates; pillar label prefix in meta descriptions; no typos). Status: **adopt immediately; ongoing — not a discrete dev task to "finish."**

**Approach (in-repo slice only):**
1. Most articles live in WordPress at the source sites, so rules 2–7 are enforced in the **WP editors**, not this repo. Produce a one-page editorial checklist doc for the content team mirroring the 7 rules.
2. In-repo enforcement: audit page copy in `apps/umg/app/{about-us,contact,how-to-enter}/page.tsx` for the H1/H2/H3 pattern; verify shared section components in `packages/ui/sections/` emit real `<h2>/<h3>` (not styled `<div>`s); confirm per-page meta descriptions start with a pillar label where relevant.
3. Validate per page with axe DevTools / HeadingsMap (no skipped heading levels).

**Dependencies / decisions:** None (editorial-owned). No blocker.
**Effort:** Ongoing; ~1–2 hrs for the in-repo audit + checklist doc.

---

### 13 — Social profile optimization (no dev)
**What / status:** Align Instagram / X / Linktree name, bio, category, and URL fields to the canonical description, and convert Linktree links to HTTPS. Status: **not started; can begin immediately — owner Allison/social team.** No code dependency.

**Approach:** Follow the platform checklists in the ticket. Canonical description (must match the Organization schema `description` in `apps/umg/app/layout.tsx`, currently in sync):
> "Washington DC's multicultural media organization, covering diplomatic affairs, community stories, and international perspectives through Diplomatic Watch, Echo Media, and International Spectrum."

Key actions: Instagram/X name + bio + category + HTTPS website field; Linktree header description, all links HTTPS, competition link starred at position 1.

**Dependencies / decisions:** Use the site's own per-division prize phrasing from `lib/competitions/current.ts` — **not** the spec's "$8K." If any handle changes, keep the `sameAs` array in `apps/umg/app/layout.tsx` (lines ~79–82) in sync.
**Effort:** ~1 hr non-dev (+ a monthly tracking check).

---

### 14.1 — Article schema on EM/IS article pages
**What / status:** Add `Article`/`NewsArticle` JSON-LD to the EM/IS article pages. (The spec's "Article schema on UMG" is a misframe — UMG has no internal article pages; it belongs here.) Status: **backlog / not started.** Per-article OG+Twitter already exists on both pages.

**Approach:**
1. In `apps/echo-media/app/articles/[slug]/page.tsx` (and the IS equivalent), build a JSON-LD object from the already-fetched `article`: `@type: "NewsArticle"`, `headline: article.title`, `datePublished: article.date`, `author: { @type: "Person", name: article.author_name }`, `image: article.featured_image ?? article.images`, `articleSection: article.category`, `publisher` (Organization for Echo Media / International Spectrum), `mainEntityOfPage` = canonical article URL.
2. Emit it — ideally via the shared `JsonLd` helper (see 14.3 recommendation) rather than a fifth hand-rolled `<script>`.
3. `dateModified`: no `modified` field on `ApiArticle` today — reuse `date`, or add `modified` in the ingestor/WP mapping (`packages/api/`) if accuracy matters.
4. Validate each page in the schema.org validator + Google Rich Results Test.

**Dependencies / decisions:** Best done together with, or after, 14.3 (shared helper) and 14.2 (EM/IS Organization schema, which supplies the `publisher`).
**Effort:** ~3–5 hrs across both sites.

---

### 14.2 — EM/IS AEO rollout (the big one)
**What / status:** Bring echo-media.info and internationalspectrum.org to UMG's AEO parity. Status: **backlog / not started; partially pre-built** (article-level OG/Twitter + `metadataBase` already present).

**Which Sprint-1/2 patterns port over verbatim vs. need adaptation:**

| UMG pattern | Ports to EM/IS | Notes |
|---|---|---|
| Organization JSON-LD in `layout.tsx` (01) | Verbatim structure | Swap name/url/logo/description/email/sameAs per site. EM/IS are `Organization`/`NewsMediaOrganization` too. |
| `sitemap.ts` + `robots.ts` (11) | Near-verbatim | Copy both files; change `BASE_URL`; EM/IS route lists differ (they have `/articles/[slug]` + categories — enumerate via `fetchAllSlugs()` like the article page already does). |
| OG/Twitter defaults in `layout.tsx` metadata (02) | Adapt | Layouts have `metadataBase` + title/description but **no** `openGraph`/`twitter` blocks — add them. |
| Footer `socials` prop (06 `rel="me"`) | Adapt | EM/IS render `<Footer>` **without** `socials`; add each site's handles once they exist. `rel="me"` support already lives in the shared Footer. |
| H1 audit (03/04) | Per-site | Audit each site's homepage/about for a single descriptive H1. |
| Article JSON-LD (14.1) | New | See 14.1. |

**Approach:** Do it site-by-site: (1) add Organization JSON-LD + OG/Twitter defaults to each `layout.tsx`; (2) copy `sitemap.ts`/`robots.ts` with per-site BASE_URL and route sources; (3) add Footer socials; (4) H1 audit; (5) Article JSON-LD on `/articles/[slug]`.
**Dependencies / decisions:** Needs each site's canonical description, logo, email, and social handles (a mini version of Q1/13 per site). Strongly benefits from 14.3 first.
**Effort:** ~1–1.5 days per site, less if 14.3 lands first.

---

### 14.3 — Extract a shared `JsonLd` helper in `packages/ui` (recommended)
**What / status:** UMG hand-rolls `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />` in **four** files today; the EM/IS rollout would add several more. Status: **not ticketed yet — recommend doing this before 14.1/14.2.**

**Recommendation: yes, extract it.** It is a tiny, high-leverage component that removes repetition and the `dangerouslySetInnerHTML` boilerplate from every page. Suggested shape:

```tsx
// packages/ui/JsonLd.tsx
export default function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```
Export from `packages/ui/index.ts`, then refactor the four UMG usages (`layout.tsx`, `how-to-enter/page.tsx`, `about-us/page.tsx`, `contact/page.tsx`) to `<JsonLd schema={...} />`, and use it for all new EM/IS schema. Keep schema-building logic in each app (facts are app-specific); the helper only handles serialization/rendering.
**Effort:** ~1 hr (component + refactor 4 call sites).

---

### 14.4 — NewsArticle schema in united-media-ingestor REST output
**What / status:** Have the WP plugin serve schema.org-shaped article metadata so any consumer can render it. Status: **backlog / low priority.**

**Approach:** In `docs/plugin/united-media-ingestor/`, extend the `um/v1/articles` item shape to include a pre-built `schema` object (or discrete `datePublished`/`author`/`publisher` fields including a real `modified` timestamp). Then `packages/api` mapping and any consumer (including a future UMG use) can emit it directly.
**Dependencies / decisions:** Only meaningfully useful if a consumer renders article schema. Since UMG links out and EM/IS use standard `wp/v2/posts` (not this feed), 14.1 rendering client-side from existing fields is the cheaper path — **14.4 is optional / lowest priority.**
**Effort:** ~2–4 hrs (WP + type plumbing).

---

### 14.5 — `llms.txt`
**What / status:** Emerging convention for AI-crawler site descriptions. Status: **backlog / speculative.**

**Approach:** Add a static `llms.txt` (e.g. `apps/umg/public/llms.txt`, or a route) with a short org description + key links, alongside the existing robots. Trivial. Adopt only if the convention gains real traction.
**Effort:** ~30 min.

---

### 14.6 — Wikipedia stub article
**What / status:** Editorial-owned; **blocked on notability** (needs independent secondary coverage of UMG first). Status: **backlog — revisit after 3–6 months of citation building.** Not a dev task.
**Effort:** 4–8 hrs editorial, later.

---

## Prioritized execution order

| # | Item | Blocker | Effort | Recommended order |
|---|---|---|---|---|
| 13 | Social profile optimization | none (non-dev) | ~1 hr | **1** — no dependency, starts entity chain |
| 12 | Content formatting standards | none (editorial) | ~1–2 hrs | **2** — ongoing, start now |
| 14.3 | Shared `JsonLd` helper in `packages/ui` | none | ~1 hr | **3** — unblocks/cheapens 14.1 & 14.2 |
| 09 | Branded OG image | designer (Q4) | ~2 hrs | **4** — do the 15-min repoint as soon as asset lands |
| 10 | GA4 + Search Console | Google account (Q3) — sitemap prereq already done | ~1 hr | **5** — do the moment Q3 clears; gives measurement |
| 14.2 | EM/IS AEO rollout | per-site brand assets/handles | ~1–1.5 days/site | **6** — after 14.3 |
| 14.1 | Article schema on EM/IS pages | 14.2 (publisher) + 14.3 | ~3–5 hrs | **7** — fold into 14.2 |
| 14.5 | `llms.txt` | none (speculative) | ~30 min | **8** — opportunistic |
| 14.4 | NewsArticle in ingestor REST | needs a consumer to matter | ~2–4 hrs | **9** — optional / lowest |
| 14.6 | Wikipedia stub | notability (external coverage) | 4–8 hrs editorial | **10** — revisit in 3–6 months |
