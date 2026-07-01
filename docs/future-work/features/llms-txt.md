# llms.txt for UMG (and EM/IS)

> Add an `llms.txt` file describing United Media Group to AI crawlers/answer engines, alongside the existing robots.txt.

## What `llms.txt` is (and is not)

`llms.txt` is an **emerging, unofficial convention** (proposed 2024 at llmstxt.org) for a Markdown file at the site root (`/llms.txt`) that gives LLMs a concise, curated description of a site plus links to its most important pages — the idea being to help AI answer engines understand and cite the site.

Honest status:
- **Not a ratified standard.** No W3C/IETF backing; adoption by major crawlers (OpenAI, Anthropic, Google, Perplexity) is **not confirmed** — most do not document reading it. Treat it as speculative/optional, on par with backlog item 14.5 ("adopt only if the convention gains traction").
- It **does not** replace `robots.txt` (crawl permission), `sitemap.xml` (URL discovery), or JSON-LD (machine-readable schema) — all already live for UMG. It is additive and low-cost.
- Low risk, low effort: worst case it is ignored; best case it improves AI comprehension/citation. Ship it opportunistically.

## Decision: static `public/llms.txt` vs. route handler

UMG serves `robots.txt` and `sitemap.xml` via **Next.js `MetadataRoute` handlers** (`apps/umg/app/robots.ts`, `apps/umg/app/sitemap.ts`, both `dynamic = "force-static"`) because Next.js provides first-class `robots`/`sitemap` conventions — there is no equivalent built-in convention for `llms.txt`.

**Use a static `apps/umg/public/llms.txt` file.** Rationale:
- Files in `public/` are served verbatim at the site root (`/llms.txt`) with the correct path — no config needed.
- The content is essentially static prose; a route handler would add boilerplate (`new Response(text, { headers })`) for zero benefit.
- A route handler (`app/llms.txt/route.ts` returning `text/plain`) is only worth it if the content must be **generated** from data (e.g. injecting the live competition deadline from `lib/competitions/current.ts`). That coupling is not worth it for a speculative file — keep the few competition facts inline and update them when the competition rolls over (same cadence as other hardcoded competition copy).

Decision: **static file.** Revisit a route handler only if we later want it auto-built from config.

## Steps (UMG)

1. Create `apps/umg/public/llms.txt` (plain UTF-8, Markdown-flavored per the convention).
2. Populate it from existing sources (do not invent facts — reuse canonical strings so it stays in sync):
   - **Org description**: the `SITE_DESCRIPTION` constant in `apps/umg/app/layout.tsx` (also the Organization schema `description`).
   - **Contact/identity**: `info@unitedmediadc.com`, Washington DC, socials from the layout `sameAs` / Footer.
   - **Key pages**: mirror the routes already in `apps/umg/app/sitemap.ts` (home, `/about-us`, `/how-to-enter`, `/photo-submission`, `/judges-panel`, `/contact`).
   - **Competition facts**: title/theme/deadline/prizes from `apps/umg/lib/competitions/current.ts` (e.g. "My Hometown, My Lens", submissions close **August 31, 2026**, First Prize $8,000).
3. Suggested content outline:
   ```markdown
   # United Media Group

   > Washington DC's multicultural media organization, covering diplomatic
   > affairs, community stories, and international perspectives through
   > Diplomatic Watch, Echo Media, and International Spectrum.

   United Media Group (UMG) is a DC-based news media organization. Contact:
   info@unitedmediadc.com.

   ## Key pages
   - [About](https://unitedmediadc.com/about-us): Who we are and what we cover.
   - [How to Enter](https://unitedmediadc.com/how-to-enter): 2026 International Youth Photography Competition details.
   - [Photo Submission](https://unitedmediadc.com/photo-submission): Enter the competition.
   - [Judges Panel](https://unitedmediadc.com/judges-panel): Competition jury.
   - [Contact](https://unitedmediadc.com/contact): Get in touch.

   ## Current competition
   - "My Hometown, My Lens" — International Youth Photography Competition (2026).
   - Submissions open March 16, 2026; deadline August 31, 2026; winners October 16, 2026.
   - Divisions: Youth (10–18) and Young Adults (19–30). First Prize $8,000.

   ## Contact
   - Email: info@unitedmediadc.com
   - X: https://x.com/unitedmedia_dc
   - Instagram: https://www.instagram.com/unitedmediagroupdc/
   ```
4. Optionally reference it from `robots.ts` output as a courtesy (non-standard; skip unless desired). No code change is required for the file itself to be served.

## EM/IS replication

Once validated on UMG, replicate per site with a static `public/llms.txt` in `apps/echo-media/` and `apps/international-spectrum/`. Adapt: swap the org name/description/base URL, drop the competition section (UMG-only), and source key pages from each site's own sitemap (they have `/articles/[slug]` + categories, unlike UMG). Fold this into the broader EM/IS AEO rollout (14.2) rather than doing it standalone.

## Testing

- Local: `pnpm dev:umg`, then fetch `http://localhost:3000/llms.txt` — expect the raw text, HTTP 200, `Content-Type: text/plain`.
- Production after deploy: `curl -sI https://unitedmediadc.com/llms.txt` returns 200; `curl -s https://unitedmediadc.com/llms.txt` returns the content.
- Sanity-check every URL in the file resolves (they should match sitemap routes).

## Effort

**Trivial — ~30 min** for UMG (one static file, no code). Each of EM/IS is another ~15–20 min. No dependencies, no blockers.
