# Social Auto-Post — Implementation Plan

Automatically push a post to the brand's social platforms (X, Instagram, later FB/LinkedIn) when an article is published, driven by per-article flags set in the editor.

> Status: **NOT STARTED and largely BLOCKED.** The trigger point exists (a publish hook already fires on every publish), but the *inputs* it needs — the per-article social flags/caption/image — can only be authored once the **custom post editor** (`future-features.md` §4, tracked here as the "em-is-post-editor" work) ships. Full API integration also needs platform developer apps + long-lived tokens that do not exist yet. This doc scopes a phased path so the low-risk pieces can land early and the expensive API work is deferred until it is actually unblocked and justified.

---

## 1. Overview

Content does **not** originate in the Next.js frontend. The `apps/*` sites are static consumers; UMG additionally aggregates the other brands via the ingestor plugin. So the auto-post trigger must live **server-side in WordPress today** (or in the future custom backend later), never in the frontend.

Crucially, the publish trigger **already exists**. Each publisher site fires a `transition_post_status` hook on publish that currently POSTs a GitHub `repository_dispatch` to rebuild the static site:

- Echo Media: `docs/plugin/em-headless-config.php:34` → `event_type: deploy-echo-media`
- International Spectrum: `docs/plugin/is-headless-config.php:86` → `event_type: deploy-international-spectrum`

A social-post handler is a **second action on the same `transition_post_status` publish edge** (or a separate `add_action('transition_post_status', ...)` in a new plugin file). No new trigger infrastructure is required — what is missing is (a) the data to post (editor flags) and (b) the outbound integration (scheduler or platform APIs + tokens).

Two integration strategies, cheapest-first:

- **Assisted / third-party scheduler** (Buffer, Zapier/Make, or IFTTT bridging an RSS/webhook). No platform tokens to maintain, no per-platform API code, no image-generation pipeline. The WP hook fires a single webhook to the scheduler, which fans out to each network. Recommended first.
- **Direct official APIs** (X API v2, Instagram Graph API, Facebook Graph, LinkedIn). Full control and the on-brand generated "social card" image, but each platform is a developer app, an OAuth/long-lived-token lifecycle, rate limits, and review. High and *ongoing* maintenance cost. Recommended only after the editor exists and volume justifies it.

---

## 2. Hard Dependencies

| Dependency | Why it blocks | State today |
|---|---|---|
| **Custom post editor (em-is-post-editor, `future-features.md` §4)** | Supplies the per-article inputs the handler reads: `post_to_x` / `post_to_ig` / `post_to_fb` / `post_to_linkedin` toggles, `social_title`, `social_caption`, `social_image_override`, `social_hashtags`. Without it there is no UI to set these and no meta to read. | Not started (no editor routes, no TipTap — see breakdown §4) |
| **Author/editor auth + roles** | The editor (and therefore the flags) sits behind the shared auth system that does not exist for EM/IS yet. | Partial — only UMG submitter email-code JWT exists (`apps/umg/lib/auth/*`, plugin `auth.php`/`jwt.php`); no EM/IS author roles |
| **Platform accounts + developer apps + tokens** (direct-API path only) | Instagram needs a Business/Creator account + linked FB Page + Meta app with `instagram_content_publish` + a long-lived token that must be refreshed. X needs a paid Developer account + OAuth keys. Each is client-owned and must be provisioned before any code can post. | None provisioned |
| **Publicly reachable image URLs** (IG/direct-API path) | Instagram Graph API pulls the image by URL; the generated card must live at a public Media Library URL. | Media Library URLs qualify, but no card-generation code exists (no GD/Imagick handler) |
| **PHP GD or Imagick on the WP host** (generated-card path only) | Needed to composite the gradient + title overlay card server-side. | Unverified on SiteGround; not used anywhere today |

Minimum viable auto-post can skip the *generated card* entirely by posting the existing featured image + excerpt + link — that removes the GD/Imagick and image-URL dependencies but still needs the editor for the flags/caption (or a blunt "post everything on publish" default with no per-article control).

---

## 3. Decisions To Make (before building)

1. **Which platforms, in what order?** UMG's live presence today is **X (`@unitedmedia_dc`) and Instagram (`unitedmediagroupdc`)** — see `apps/umg/app/layout.tsx:79-82` (Org schema `sameAs`) and `:121-124` (Footer `socials`). Recommend matching that: **X first** (simplest API, text+link, no image pipeline required), Instagram second (needs an image and the Meta app), FB/LinkedIn only if the brands actually run those pages.
2. **Scheduler vs. official APIs?** Recommend **starting with a scheduler** (Buffer/Zapier/Make). It removes token maintenance and per-platform code, and de-risks the whole feature while the editor is still being built. Move to official APIs only if you need the branded generated card, exact caption control, or you outgrow the scheduler's free tier.
3. **Per-brand accounts.** Each brand (UMG, Echo Media, International Spectrum) has its own audience → its own social accounts, its own scheduler destination or its own set of tokens, stored per WP install. Do **not** share one app/token across brands. UMG is an aggregator; decide whether UMG auto-posts its own aggregated feed or only the source brands post (avoid double-posting the same story on both the source brand and UMG).
4. **Generated social card — build or skip?** The gradient+title card (`future-features.md` §5) is the most expensive, least reusable piece (WP-specific GD/Imagick, thrown away in a future Node backend). Recommend **skip for v1**; post the featured image (or `social_image_override`) as-is. Add the card only if design demands it.
5. **Default behavior when no flag is set.** Opt-in (author must tick the box) vs. opt-out (auto-post everything unless suppressed). Recommend **opt-in** to avoid accidental posts and to stay under Instagram's 25-posts/24h limit.
6. **Where the handler lives now vs. later.** Build in the **WP plugin now** (hook already there). When/if the custom backend lands (`custom-backend-plan.md`), this becomes a Node image/post pipeline + queue reading the same flags off the `articles` table — keep the flag names identical so the contract survives the migration.

---

## 4. Recommended Phased Approach

### Phase 0 — Groundwork (mostly blocked on the editor)
1. Confirm the editor plan (`future-features.md` §4) will register the social meta fields with `show_in_rest` — same pattern as `docs/plugin/is-headless-config.php` registers `video_url`. Flags: `post_to_x`, `post_to_ig`, `post_to_fb`, `post_to_linkedin`, `social_title`, `social_caption`, `social_image_override`, `social_hashtags`. **This is the gate — nothing meaningful ships until these exist.**
2. Decide platforms + scheduler-vs-API + per-brand accounts (§3). Provision the client-owned accounts under the brand's name.

### Phase 1 — Assisted / scheduler auto-post (recommended first, minimal code)
3. Add a new plugin handler on the existing publish edge — a second `add_action('transition_post_status', ...)` living in a new file (e.g. `includes/social-post.php`) alongside the current rebuild dispatch in `em-headless-config.php` / `is-headless-config.php`. Guard identically: `post_type === 'post'`, transition into `publish`, and only when the article's `post_to_*` flag is set.
4. On that edge, POST a compact JSON payload (title/`social_title`, `social_caption`/excerpt, canonical URL, featured or `social_image_override` image URL, `social_hashtags`) to a **scheduler ingest webhook** (Zapier/Make/Buffer). Store the webhook URL + any secret in WP options / `wp-config` constants, mirroring how `GH_REBUILD_TOKEN` is handled today.
5. Configure the scheduler to fan out to X and Instagram for that brand. Log the response to WP (reuse the webhook-logging pattern added for the Stripe webhook in `docs/plugin/umg-photo-contest/includes/payment.php`).
6. **Even-cheaper fallback if the editor slips:** point the scheduler at each brand's existing public RSS feed with a per-item "post to social" rule. Zero plugin code, zero flags — but no per-article control and no custom caption. Use only as a stopgap.

### Phase 2 — Direct official APIs (deferred; only if Phase 1 is outgrown)
7. Register client-owned developer apps: X (v2), Meta (Instagram Graph + FB), LinkedIn as needed. Store long-lived tokens per brand in WP options; add a token-refresh cron (mirror the ingestor's cron pattern in `docs/plugin/united-media-ingestor/includes/cron.php`).
8. Replace the scheduler webhook with per-platform handlers (one function per network, each gated by its `post_to_*` flag) in `includes/social-post.php`. Start with X (text + link + image), then Instagram Graph (two-step: create media container from a public image URL → publish; respect 25/24h).
9. Persist the returned platform post IDs back as post meta for reference/idempotency, and make the handler **idempotent** (never re-post on a re-publish/update transition).

### Phase 3 — Generated social card (optional, most expensive; skip unless required)
10. Add a GD/Imagick compositor (load featured/override image → black gradient bottom ~30% → white `social_title` via `imagettftext` → optional logo → save to Media Library) invoked before the IG publish step. Add the live CSS preview in the editor. Confirm GD/Imagick is available on the host first.

---

## 5. Real File / Hook Locations

| Purpose | Location |
|---|---|
| **Publish trigger to reuse** (Echo Media) | `docs/plugin/em-headless-config.php:34` (`transition_post_status` → GitHub dispatch `deploy-echo-media`) |
| **Publish trigger to reuse** (Int. Spectrum) | `docs/plugin/is-headless-config.php:86` (`transition_post_status` → dispatch `deploy-international-spectrum`) |
| **Secret/token storage pattern** | `GH_REBUILD_TOKEN` constant used at `is-headless-config.php:90-94` — mirror for the scheduler webhook / platform tokens |
| **`show_in_rest` meta registration pattern** (for the flags) | `is-headless-config.php` `video_url` meta box + registration |
| **Webhook logging pattern** | `docs/plugin/umg-photo-contest/includes/payment.php` (Stripe webhook, signature verify + logging) |
| **Cron pattern** (token refresh) | `docs/plugin/united-media-ingestor/includes/cron.php` |
| **New plugin file to add** | `docs/plugin/<em|is>-headless-config` companion, e.g. `includes/social-post.php` per brand |
| **Editor that must supply the flags** | Not built — `future-features.md` §4 / breakdown §4; no `apps/*/app/editor` route or TipTap dependency exists |
| **Existing social identity (source of truth for handles)** | `apps/umg/app/layout.tsx:79-82` (Org schema `sameAs`) and `:121-124` (Footer `socials`); Footer prop at `packages/ui/Footer.tsx:12` |
| **Future backend home for this logic** | `claude-context/custom-backend-plan.md` — becomes a Node post/image pipeline + queue on the `articles` table |

---

## 6. Effort & Dependency Graph

```
[Auth + roles for EM/IS] ──► [Custom post editor (§4)] ──► [Social flags/meta]
                                                                │
                            [Platform accounts + tokens] ───────┤
                                                                ▼
                                    Phase 1: Scheduler auto-post (S)
                                                                │
                                                                ▼
                                    Phase 2: Direct official APIs (L)
                                                                │
                                                                ▼
                                    Phase 3: Generated card, GD/Imagick (M)
```

- **Phase 1 (scheduler): S** once the editor flags exist — mostly one WP hook + external no-code config. The RSS stopgap (step 6) is **XS** and needs no editor.
- **Phase 2 (official APIs): L** — per-platform apps, token lifecycle, rate limits, idempotency; ongoing maintenance cost.
- **Phase 3 (generated card): M** — WP-specific GD/Imagick, host-dependent, discarded in a future backend migration.

**Bottom line:** blocked on the editor + auth for the meaningful version; do **not** start Phase 1's per-article work until those land. Provision accounts and pick scheduler-vs-API in parallel now. When unblocked, ship the scheduler path first and defer official-API and card generation until real need justifies the ongoing token/maintenance burden. This is the lowest-priority item in the roadmap (breakdown §5) and the least reusable across the planned custom-backend migration.
