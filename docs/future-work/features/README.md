# Feature Implementation Plans

One doc per open, buildable feature — each a step-by-step "what we need to do to
implement it", verified against the current code. Payment bug-fixes and deferred
security items live one level up in [`../remediation/`](../remediation/); this
folder is the roadmap/AEO build work.

## Index

| Feature | Doc | Status / note |
| --- | --- | --- |
| Judge/admin scoring dashboard | [judge-admin-dashboard.md](judge-admin-dashboard.md) | Not built; **time-boxed** (jury Sept–Oct 2026) |
| Donations | [donations.md](donations.md) | XS; independent Stripe Payment Link |
| EM/IS AEO rollout (+ shared JsonLd helper) | [em-is-aeo-rollout.md](em-is-aeo-rollout.md) | Ports done UMG work; Step 0 unblocks others |
| EM/IS article schema | [em-is-article-schema.md](em-is-article-schema.md) | Depends on JsonLd helper |
| GA4 + Search Console | [analytics-search-console.md](analytics-search-console.md) | Code-unblocked; waits on Google account (Q3) |
| OG share image | [og-share-image.md](og-share-image.md) | Already functional; quality upgrade |
| Social profiles rollout | [social-profiles.md](social-profiles.md) | Code may be near no-op; waits on handle sign-off |
| llms.txt | [llms-txt.md](llms-txt.md) | Trivial; emerging/optional convention |
| EM category overhaul | [em-category-overhaul.md](em-category-overhaul.md) | Mechanical; blocked on final category list |
| EM/IS custom post editor | [em-is-post-editor.md](em-is-post-editor.md) | Recommend **defer** into custom backend |
| Social auto-post | [social-auto-post.md](social-auto-post.md) | Blocked on editor; start with a scheduler |

## Recommended build order

**Tier 1 — do now (unblocked, high value):**
1. **Judge/admin dashboard** — the only deadline-bound item (jury review Sept–Oct 2026). Build in WP now, keep the REST contract clean for a later backend port.
2. **EM/IS AEO rollout, Step 0** — extract the shared `packages/ui/JsonLd` helper (migrate UMG's 4 hand-rolled spots). Enables the article-schema work.
3. **llms.txt** and **OG share image (Option B, dynamic)** — trivial, code-only.
4. **Donations** — if wanted; XS. ⚠️ Must gate the webhook (see below).

**Tier 2 — unblocked but lower urgency:**
5. **EM/IS AEO rollout** (rest) + **EM/IS article schema** — needs Step 0 first; article schema's `dateModified` closes trivially since `wp/v2/posts` already returns `modified`.
6. **GA4 + Search Console** — ship the env-guarded GA component now; measurement id + Search Console wait on the Google account (Q3).

**Tier 3 — blocked on external decisions:**
7. **Social profiles** — code is near-no-op once official handles are confirmed. **EM/IS have no social handles anywhere in the repo** — that blocks EM/IS socials + schema `sameAs`.
8. **EM category overhaul** — mechanical; blocked on the final category list.

**Tier 4 — defer into the custom backend:**
9. **EM/IS post editor** (migration-adjacent; wp-admin works today) → then **social auto-post** (hangs off the existing `transition_post_status` publish hook, but needs the editor + platform tokens first).

## Cross-cutting facts the agents verified

- **Static export everywhere** (`output: "export"` on UMG and EM/IS) — dynamic routes (`opengraph-image`, editor pages, judge routes) must be client-side shells or build-time-emitted; no server runtime. This shapes several plans.
- **⚠️ New payment bug found (donations agent):** `umgpc_stripe_webhook` acts on *every* completed checkout on the Stripe account, so adding any second Payment Link (donations, merch) will mark a matching user `paid`. Gate the webhook on `purpose: entry_fee` session metadata. Logged against the audit as a follow-up to [I-2].
- **No shared `JsonLd` helper exists** — UMG hand-rolls `application/ld+json` in `layout.tsx`, `how-to-enter/`, `about-us/`, `contact/`. Extract before the EM/IS rollout.
- **EM/IS blockers:** no social handles in the repo; IS has only an SVG logo (no raster for schema `logo`); both still expose a Gmail address that shouldn't go in schema.
