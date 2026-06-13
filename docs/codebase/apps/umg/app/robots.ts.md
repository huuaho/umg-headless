# apps/umg/app/robots.ts

**Purpose:** Generates `/robots.txt` for the UMG site at build time.

## Responsibilities
A Next.js App Router metadata route (`force-static`). Returns a `MetadataRoute.Robots` that allows all crawlers (`*` → `/`) and explicitly names the AI crawlers — `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `CCBot` — also allowed. Points at the sitemap (`https://unitedmediadc.com/sitemap.xml`). The explicit AI-bot allowance is deliberate: the AEO goal is to be crawled and cited by answer engines.

## Key exports
- `default robots() -> MetadataRoute.Robots`
- `dynamic = "force-static"`

## Dependencies
- Internal: pairs with [sitemap.ts](sitemap.ts.md) (the `sitemap:` line)
- External: `next` (`MetadataRoute` type)

## Used by
Build output `apps/umg/out/robots.txt`.

## Notes
The deployed `robots.txt` on SiteGround currently shows an extra `Crawl-delay: 10` line not present in this source — SiteGround injects it. Harmless (Google and most AI bots ignore crawl-delay), but a source-vs-served discrepancy to be aware of.

---
*Documented at commit 60deaa3.*
