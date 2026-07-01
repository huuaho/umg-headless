# Google Analytics (GA4) + Google Search Console — UMG

> Wire GA4 into the UMG app and verify + submit the sitemap in Google Search Console, so we can measure whether the AEO work (AI crawler activity, brand-query impressions, AI referral traffic) is actually landing.

Ticket: `claude-context/current-work/sprint-2-enhancements/10-analytics-search-console.md` (AEO 10, Status: not started). Spec ref: PDF §8 Sprint 2, §9 monitoring. Effort: ~1 hr dev once unblocked.

---

## Overview

Two independent pieces:

1. **GA4** — a code change in `apps/umg/app/layout.tsx` plus one env var/secret. Traffic + engagement analytics.
2. **Search Console** — a non-code Google/DNS task. Verify ownership of the domain, then submit the sitemap that is **already live**. Gives crawl stats (including GPTBot), index coverage, and brand-query impressions.

## Current blocker: the Google account, not the code

- The ticket's stated blocker — *"do the sitemap first"* — is **already satisfied.** `apps/umg/app/sitemap.ts` and `apps/umg/app/robots.ts` are live (verified). `robots.ts` explicitly welcomes GPTBot/PerplexityBot/ClaudeBot/Google-Extended/CCBot and points at `https://unitedmediadc.com/sitemap.xml`. So ticket 10 is **code-unblocked.**
- The real blocker is **Q3 in `claude-context/current-work/notion-open-questions.md`**: which Google account will *own* Analytics + Search Console (the `info@unitedmediadc.com` alias can create one at accounts.google.com). Nothing measurable exists until that account is decided and we have access. Coordinate with Allison.
- **Doable now vs. blocked on Q3:**
  - *Doable now (code, safe to merge):* add the `<GoogleAnalytics>` component behind an env-var guard. With no `NEXT_PUBLIC_GA_ID` set, it renders nothing — a no-op until the ID exists. This lets us land + review the code ahead of the account decision.
  - *Blocked on Q3:* creating the GA4 property (to get the measurement ID `G-XXXXXXXXXX`), populating the secret, and all of Search Console (verification + sitemap submission).

## Verified repo facts (2026-06-30)

- **Next.js `16.2.7`, React `19.2.7`, App Router.** `apps/umg/next.config.ts` uses **`output: "export"` + `trailingSlash: true`** → the site is a **static export** deployed to SiteGround over FTP (`.github/workflows/deploy-umg.yml`, `local-dir: ./apps/umg/out/`). No Node server at runtime, so GA must be **client-side script injection** (which is exactly what the recommended component does — fine for static export).
- **`@next/third-parties` is NOT currently installed** (not in `apps/umg/package.json`; absent from `node_modules`). It must be added.
- **`NEXT_PUBLIC_*` env vars are inlined at build time.** Existing pattern: `NEXT_PUBLIC_WP_API_URL` is set from the `UMG_WP_API_URL` GitHub secret in the deploy workflow's `Build` step and consumed in `layout.tsx` (`process.env.NEXT_PUBLIC_WP_API_URL`). GA mirrors this pattern exactly.
- **`.env*` is gitignored** (`.gitignore`), and `apps/umg/.env.local` already exists — the local ID goes there, uncommitted.
- Root layout already hand-rolls the Organization JSON-LD `<script>` and mounts `<Header>`/`<Footer>` — the GA component slots in alongside them in `<body>`.

---

## Step 1 — GA4 (code)

**Recommendation: use `@next/third-parties/google` `<GoogleAnalytics>`**, not a raw `next/script` block. It is Next's official, App-Router-native helper: it injects `gtag.js` with the right load strategy, handles SPA route-change pageviews automatically (App Router client navigations that a raw one-shot script would miss), and is a single line. It works with `output: "export"` because it only emits client-side scripts. (The ticket text predates this and says `next/script`; the component is the better call and still satisfies every validation item.)

1. **Add the dependency** (must track the Next major — Next 16):
   ```bash
   pnpm --filter umg add @next/third-parties@16.2.7
   ```
   (If that exact version is unavailable, pin to the latest `@next/third-parties` that supports Next 16; confirm at install time.)

2. **Mount it in `apps/umg/app/layout.tsx`**, guarded on the env var so dev and un-provisioned builds are clean:
   ```tsx
   import { GoogleAnalytics } from "@next/third-parties/google";
   // ...
   const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
   // inside <body>, alongside the existing JSON-LD <script>:
   {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
   ```
   The presence-guard is the cleanest way to satisfy the ticket's "NOT firing in `pnpm dev:umg`" requirement: don't put `NEXT_PUBLIC_GA_ID` in local `.env.local` (or leave it empty) → nothing renders. This is more robust than a `NODE_ENV === 'production'` check, since a static export always builds in production mode regardless of environment.

3. **Wire the env var (mirror `NEXT_PUBLIC_WP_API_URL`):**
   - **Local:** add `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX` to `apps/umg/.env.local` **only if** you want to test locally; otherwise leave it out to keep dev clean. (`.env*` is gitignored — never commit the ID this way.)
   - **GitHub secret:** add repo secret **`UMG_GA_ID`** = `G-XXXXXXXXXX`.
   - **Deploy workflow:** in `.github/workflows/deploy-umg.yml`, add to the `Build` step `env:` block (next to `NEXT_PUBLIC_WP_API_URL`):
     ```yaml
     NEXT_PUBLIC_GA_ID: ${{ secrets.UMG_GA_ID }}
     ```
   - Because the value is inlined at build, it only reaches production builds → EM/IS are untouched (GA lives solely in the UMG layout; nothing added to `apps/echo-media` or `apps/international-spectrum`).

4. **Consent considerations.** UMG has no cookie-consent banner today and GA4 sets first-party cookies. Options, in order of effort:
   - *Minimum:* rely on GA4's built-in IP anonymization (on by default in GA4) and add a short "we use Google Analytics" line to any privacy/contact copy. Acceptable for a US-audience site.
   - *If EU/UK traffic matters:* GA4 Consent Mode v2 — defer/deny analytics storage until consent. That needs a consent banner (out of scope for this ~1 hr ticket; flag as a follow-up if legal requires it). The env-guarded component makes it easy to later wrap in a consent gate.

## Step 2 — Search Console (non-code, blocked on Q3)

Goal: verify the **Domain property** `unitedmediadc.com` (a Domain property covers `www` + non-`www` + `http`/`https` in one shot) and submit the sitemap.

1. **Create the property** in Search Console under the owning Google account (Q3) → *Add property* → **Domain** → `unitedmediadc.com`.

2. **Verification method — recommendation: DNS TXT.**
   - **DNS TXT (recommended):** required for a *Domain* property, and it's the most durable (survives redeploys, covers all subdomains/protocols). Add the Google-provided `google-site-verification=…` TXT record in **SiteGround → Site Tools → Domain → DNS Zone Editor**. This is the method the ticket calls for.
   - **HTML meta tag (alternative):** only verifies a single *URL-prefix* property, and on a static export the tag would have to be added to `apps/umg/app/layout.tsx` metadata (`verification: { google: "…" }` in the `Metadata` object) and redeployed. More code + narrower coverage — use only if DNS access is unavailable.
   - **Sitemap submission is NOT a verification method** — it happens *after* verification. The live sitemap doesn't get us out of the DNS/meta step.

3. **Submit the sitemap:** Search Console → *Sitemaps* → enter `sitemap.xml` (full URL `https://unitedmediadc.com/sitemap.xml`) → Submit. It's already served by `apps/umg/app/sitemap.ts`; expect status **"Success."**

4. **Record the §9 monitoring cadence** at the bottom of the ticket once live: monthly manual AI tests ("Who is United Media Group?" on ChatGPT/Perplexity/Google), GSC crawl stats filtered for GPTBot, and referral traffic in GA4 from `chatgpt.com` / `perplexity.ai`.

---

## Testing

- **GA4 Realtime:** deploy to production, visit `https://unitedmediadc.com`, confirm your session appears in GA4 → *Reports → Realtime* within ~30s. (Realtime needs the built bundle to contain the ID — it won't show from `pnpm dev:umg` unless you deliberately set the local var.)
- **Tag presence:** view page source / DevTools Network on production → `gtag/js?id=G-…` request fires; **not** present on a local dev build with no `NEXT_PUBLIC_GA_ID`.
- **No regressions:** no console errors from the GA script on load; Lighthouse performance delta < 5 points; EM/IS builds unchanged.
- **Search Console:** *URL Inspection* on `/` returns "URL is on Google" (or "Crawled" pending indexing); *Sitemaps* shows "Success"; within ~2 weeks the Coverage/Pages report lists `/`, `/about-us/`, `/how-to-enter/`, `/contact/` as indexed.

## Effort

- GA4 code + env/secret wiring: **~30–45 min** once the measurement ID exists.
- Search Console (DNS TXT + sitemap submit): **~15 min** of work + DNS propagation + a Google account decision (Q3) that must land first.
- Consent banner (only if EU/UK legal requires it): **separate follow-up, not included.**
