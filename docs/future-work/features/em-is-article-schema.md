# EM/IS Article Schema (Article / NewsArticle JSON-LD)

> Add `NewsArticle`/`Article` structured data to the Echo Media and International Spectrum `/articles/[slug]` pages, built from data already fetched, and — optionally — expose schema-shaped fields from the WordPress ingestor. Article-level JSON-LD only; site-level Organization/OG/sitemap work belongs to `em-is-aeo-rollout` (backlog item 14.2) and is out of scope here.

## Scope

- **In scope:** backlog item 14.1 — render `NewsArticle` JSON-LD on both EM/IS article pages; the `dateModified` data gap (backlog note on `ApiArticle` having no `modified` field); optional backlog item 14.4 — schema-shaped metadata in `united-media-ingestor` REST output.
- **Out of scope:** Organization JSON-LD, OG/Twitter defaults in `layout.tsx`, sitemap/robots, footer socials, H1 audits. Those are `em-is-aeo-rollout`.

## Repo reality (verified 2026-06-30)

- Both article pages already exist and already emit per-article **OpenGraph + Twitter** in `generateMetadata`, but **no JSON-LD**:
  - `apps/echo-media/app/articles/[slug]/page.tsx`
  - `apps/international-spectrum/app/articles/[slug]/page.tsx`
  - They differ only slightly (IS also passes `videoUrl` to `ArticleLayout`; titles/suffixes differ). The metadata blocks are otherwise identical, so the JSON-LD addition is the same on both.
- Data layer: `packages/api/types.ts` (`ApiArticle`) and `packages/api/wp-client.ts` (`wpPostToApiArticle`, `fetchArticleBySlugWP`). EM/IS run in **"wp" mode** (`wp/v2/posts?_embed`), **not** the ingestor feed.
- `ApiArticle` fields available today: `id, title, slug, date, source, source_label, source_url, excerpt, content, featured_image, images[], author_name, category, categories[], read_time_minutes, is_excluded, video_url?`. Enough for `headline`, `datePublished`, `author`, `image`, `articleSection`, `mainEntityOfPage`.
- **`dateModified` gap:** there is no `modified` field on `ApiArticle`. BUT — the standard WP REST post (`wp/v2/posts`) that EM/IS already fetch **returns a top-level `modified` (and `modified_gmt`) string natively**. So for EM/IS the fix is a cheap type + mapping change in `packages/api` — **no plugin change required** (that is the 14.4 path, and only matters for the UMG ingestor feed).
- **Shared `JsonLd` helper does not exist yet.** `packages/ui/index.ts` exports no such component; UMG hand-rolls the `<script type="application/ld+json">` block in four files. This plan treats `packages/ui/JsonLd` as a dependency to be delivered by `em-is-aeo-rollout` item 14.3. If that lands first, use it; otherwise this plan includes a fallback (create the helper here, or inline the script).

## Dependencies

1. **`packages/ui/JsonLd` helper (14.3, recommended first).** Tiny wrapper around `<script type="application/ld+json" dangerouslySetInnerHTML>`. Referenced from `docs/future-work/features/em-is-aeo-rollout.md` (14.3). If not yet shipped, Phase 0 below creates it.
2. **`publisher` identity per site (soft dependency).** The `publisher` Organization node ideally mirrors the site-level Organization schema that `em-is-aeo-rollout` (14.2) adds. This plan does not block on 14.2 — it inlines a minimal `publisher` object per site (name + logo URL) and notes it should be kept in sync with the layout Organization schema once that ships.
3. **`modified` field plumbing (Phase 1).** Required for an accurate `dateModified`; small `packages/api` change.

## Field mapping (NewsArticle → ApiArticle)

Per-site canonical base URL: Echo Media `https://echo-media.info`, International Spectrum `https://internationalspectrum.org` (confirm against each app's `metadataBase` in `layout.tsx`).

| JSON-LD property | Source |
|---|---|
| `@context` | `"https://schema.org"` |
| `@type` | `"NewsArticle"` |
| `headline` | `article.title` |
| `description` | `article.excerpt` |
| `datePublished` | `article.date` (ISO 8601 from WP) |
| `dateModified` | `article.modified` (Phase 1) — fall back to `article.date` until Phase 1 lands |
| `author` | `{ "@type": "Person", "name": article.author_name }` |
| `image` | `article.featured_image ?? article.images?.[0]` (array `article.images` also valid) |
| `articleSection` | `article.category` |
| `publisher` | `{ "@type": "Organization", "name": <site name>, "logo": { "@type": "ImageObject", "url": <site logo URL> } }` |
| `mainEntityOfPage` | `{ "@type": "WebPage", "@id": ` + `${BASE_URL}/articles/${article.slug}` + ` }` |

Guard optional fields: only include `image` when a URL exists; omit `author` if `author_name` is empty/"Unknown"/"Not Credited".

## Phase 0 — `JsonLd` helper (only if 14.3 hasn't shipped)

Skip if `em-is-aeo-rollout` 14.3 already delivered `packages/ui/JsonLd`.

1. Create `packages/ui/JsonLd.tsx`: a component taking `{ schema: Record<string, unknown> }` that renders `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />`.
2. Export it from `packages/ui/index.ts`.
- **Effort:** ~30 min. Coordinate so this isn't done twice with 14.3.

## Phase 1 — add `modified` / `dateModified` support (packages/api)

The cheap, EM/IS-only path (no WP plugin work):

1. `packages/api/types.ts`:
   - Add `modified?: string;` to `ApiArticle`.
   - Add `modified: string;` (and optionally `modified_gmt`) to the `WpPost` interface — WP REST already returns these top-level.
2. `packages/api/wp-client.ts` → `wpPostToApiArticle`: add `modified: post.modified,` to the returned object. No fetch changes needed (`_embed` responses already include `modified`).
3. Nothing else consumes `modified`, so this is additive and safe.
- **Effort:** ~20 min. Do this before Phase 2 so `dateModified` is accurate from day one. If deferred, Phase 2 falls back to `article.date` for `dateModified`.

## Phase 2 — render Article JSON-LD on both pages

Do the same edit in each of:
- `apps/echo-media/app/articles/[slug]/page.tsx`
- `apps/international-spectrum/app/articles/[slug]/page.tsx`

Steps (per page):

1. `import { JsonLd } from "@umg/ui";` (alongside the existing `ArticleLayout` import).
2. In the default page component, after `article` is fetched and the `notFound()` guard, build a `articleSchema` object using the field mapping above. Define a per-site `BASE_URL`, site name, and logo URL as local constants (or import from a small per-app constants module if one exists).
3. Render `<JsonLd schema={articleSchema} />` inside the returned JSX, as a sibling of `<ArticleLayout ... />` (wrap both in a fragment). Placement in `<body>` is fine for JSON-LD.
4. Keep the existing `generateMetadata` OG/Twitter block untouched — JSON-LD is complementary, not a replacement.

Notes:
- Build the schema object in the page (app-specific facts stay in the app); the helper only serializes/renders.
- The two files are near-identical; write one, mirror to the other, adjusting `BASE_URL`, site name, logo, and title suffix.
- **Effort:** ~2–3 hrs for both pages incl. validation.

## Phase 3 (optional / lowest priority) — 14.4: schema-shaped fields in the ingestor

**Recommendation: defer / probably skip.** EM/IS get everything they need from `wp/v2/posts` (Phases 1–2); the ingestor feed (`um/v1/articles`) is consumed **only by UMG**, and UMG has no internal article pages (its cards link out to source sites). So there is **no consumer** that would render ingestor-supplied article schema today. Build this only if a future UMG feature renders article pages from the feed.

If/when it becomes worth it:

1. **Capture `modified` during ingestion.** In `docs/plugin/united-media-ingestor/includes/storage.php`, where the remote post is normalized/stored (near the `um_date_gmt` / author meta writes), read the remote post's `modified`/`modified_gmt` and `update_post_meta($post_id, 'um_modified_gmt', ...)`. Backfill needs a re-ingest to populate existing posts.
2. **Expose it in REST.** In `docs/plugin/united-media-ingestor/includes/rest-api.php` (the `$item` array around line 161), add `'modified' => get_post_meta($p->ID, 'um_modified_gmt', true) ?: <date fallback>` next to the existing `'date'` line. Optionally add a pre-built `'schema'` object, though discrete fields keep the client in control of `@id`/publisher.
3. **Plumb through `packages/api`.** The custom-mode mapper (the `um/v1/articles` → `ApiArticle` path in `packages/api`) maps the new `modified` field onto `ApiArticle.modified` (already added in Phase 1).
- **Effort:** ~2–4 hrs (WP capture + backfill + type plumbing). **Verdict:** not worth it until a consumer exists — Phases 1–2 already close 14.1 for the sites that actually render articles.

## Testing / validation

1. `pnpm dev` each site; open a real article and confirm exactly one `<script type="application/ld+json">` block renders with valid JSON (no `undefined` values, no missing commas).
2. Google **Rich Results Test** and the **schema.org validator** on a deployed (or ngrok/tunnelled) article URL for each site — expect a valid `NewsArticle` with no errors; warnings for optional fields (e.g. missing `dateModified`) are acceptable but should be gone once Phase 1 lands.
3. Spot-check `datePublished`/`dateModified` are ISO 8601 and that `mainEntityOfPage.@id` matches the canonical article URL.
4. Confirm `author` is omitted (not `"Unknown"`/`"Not Credited"`) when uncredited.

## Order & effort summary

| Phase | Work | Depends on | Effort |
|---|---|---|---|
| 0 | `packages/ui/JsonLd` helper | — (skip if 14.3 shipped) | ~30 min |
| 1 | `modified`/`dateModified` in `packages/api` | — | ~20 min |
| 2 | Render `NewsArticle` JSON-LD on both EM/IS pages | 0, 1 | ~2–3 hrs |
| 3 | (optional) ingestor `modified` + schema fields | needs a consumer | ~2–4 hrs — **defer** |

**Total for 14.1 (Phases 0–2): ~3–4 hrs.** Phase 3 (14.4) is optional and recommended to skip until a consumer renders ingestor-fed article pages.
