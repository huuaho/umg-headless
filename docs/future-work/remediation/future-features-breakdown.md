# Future Features — Breakdown & Build-Status Reconciliation

> Intent: take every item tracked in `claude-context/future-features.md` (plus `em-category-overhaul.md`), check it against what is **actually in the codebase today**, and turn the remainder into a concrete, file-level implementation plan tied to the custom-backend migration.

Source docs reconciled:
- `claude-context/future-features.md` — the five feature sections.
- `claude-context/em-category-overhaul.md` — Echo Media category overhaul (reference-for-later).
- `claude-context/custom-backend-plan.md` — long-term WordPress → custom backend migration.

**Headline finding:** the "Art Submission System" (public flow) and its payment piece are **already built** as the live photo contest, and a **reusable JWT auth mechanism** already exists. The remaining gaps are the **judge/admin dashboard**, the **EM/IS custom editor**, and **social auto-post** — none of which are started.

---

## 1. User Authentication & Admin Login

**One-line:** Login system so admin/judge users can reach protected pages; WP owns auth, Next.js is a client-side shell that fetches protected content after verifying a token.

**Status: PARTIALLY BUILT** — the auth *mechanism* exists and works in production, but it is a **submitter** login, not the **admin/judge** login the doc describes.

What exists (evidence):
- Custom JWT implementation (HMAC-SHA256, no external plugin): `docs/plugin/umg-photo-contest/includes/jwt.php` (`umgpc_generate_jwt`, `umgpc_validate_jwt`, `umgpc_get_user_from_request`).
- **Passwordless email-code** flow (not username/password): `docs/plugin/umg-photo-contest/includes/auth.php` — `POST /umg/v1/auth/request-code`, `POST /umg/v1/auth/verify-code`, `GET /umg/v1/me`.
- Frontend auth client + context: `apps/umg/lib/auth/api.ts`, `apps/umg/lib/auth/AuthContext.tsx`, `apps/umg/lib/auth/types.ts`. Token stored in **localStorage** (`umgpc_token`), not an httpOnly cookie.
- Login UI: `apps/umg/app/photo-submission/components/AuthForm.tsx`.

How it **differs from the doc** (these are the gaps):
- The doc assumes the **"JWT Authentication for WP REST API"** plugin + a `/wp-json/jwt-auth/v1/token` username/password endpoint. Reality is a **hand-rolled** JWT + email-code flow. Functionally equivalent and arguably better for the submitter use case, but there is no username/password path.
- All accounts are created with the WP **`subscriber`** role (`auth.php` line ~83). There are **no "Judge" / "Admin" custom roles** and no role scoping.
- There is **no `/login` route and no `/admin/*` route**. The only login surface is embedded in `/photo-submission`. (`apps/umg/app/` contains: about-us, category, contact, how-to-enter, judges-panel, photo-submission, search — no admin/login dirs.)
- `apps/umg/app/judges-panel/page.tsx` is a **public "Meet the Judges" bio page** (renders `lib/competitions/judges.tsx`), **not** an authenticated judging dashboard.

Implementation breakdown to close the gap (admin/judge login):
- **Decision — reuse vs. add a plugin:** reuse the existing `umgpc_*` JWT rather than installing the JWT Authentication plugin. Add an **admin login path** — either extend `auth.php` with a password-verify endpoint for privileged users, or gate the email-code flow so only users with a judge/admin capability can reach admin data.
- **Roles:** register `judge` (and optionally `editor`/`admin` scoping) roles in the plugin (new `includes/roles.php`, called from `umg-photo-contest.php`). Add a capability check helper alongside `umgpc_get_user_from_request` in `jwt.php`.
- **Frontend:** add `apps/umg/app/admin/layout.tsx` doing a client-side auth+role check (reusing `useAuth`) and a `apps/umg/app/(admin)/login` surface. Keep the "empty shell at build time, data behind authenticated REST" model the doc calls for — that already matches how `photo-submission` works with static export.
- **Security note:** consider moving the token from localStorage to an httpOnly cookie if admin scope is added (XSS exposure matters more for privileged accounts).

**Relation to custom-backend migration:** auth/judges/users is explicitly a "new feature enabled" by the custom backend (`custom-backend-plan.md`). But the WP mechanism is already live and cheap — **build the judge role + admin login in WP now**; do not wait for the migration. When the backend moves to Postgres/Supabase, the JWT contract (`Bearer` token, `/me`) can be preserved so the frontend barely changes.

---

## 2. Art Submission System

**One-line:** Public form for artists to submit entries (data + file upload), plus an admin dashboard where judges review and score them.

**Status: SPLIT — Flow 1 (public submitter) ALREADY BUILT; Flow 2 (admin/judge dashboard) NOT STARTED.**

### Flow 1 — Public Submitter: ALREADY BUILT (as the live photo contest)

Evidence:
- Public pages: `apps/umg/app/photo-submission/page.tsx`, `apps/umg/app/photo-submission/layout.tsx`, and `apps/umg/app/how-to-enter/page.tsx`.
- Form UI with file upload, per-photo title/description, consents, student proof: `apps/umg/app/photo-submission/components/SubmissionForm.tsx`.
- Competition config / rules / divisions / awards / judging criteria: `apps/umg/lib/competitions/current.ts`, `apps/umg/lib/competitions/types.ts`.
- **Custom Post Type** `umg_submission`: `docs/plugin/umg-photo-contest/includes/post-types.php`.
- REST endpoints (draft-centric, richer than the doc's single POST): `docs/plugin/umg-photo-contest/includes/draft.php` (`GET/PUT /draft`, `POST /draft/photo`, `DELETE /draft/photo/{id}`, `POST/DELETE /draft/student-proof`), and finalize `POST /umg/v1/submit` in `includes/submission.php`.
- File storage = WP **Media Library** (the doc's "Option A"): uploads handled in `draft.php`.
- Orphaned-draft cleanup cron: `docs/plugin/umg-photo-contest/includes/cleanup.php`.

How it differs from the doc (not gaps — just note the design chosen):
- The doc imagined one multipart `POST /wp-json/umg/v1/submit` carrying everything. Reality is a **draft model**: one draft per authenticated user, incremental save/upload, then a lightweight `submit` that flips status `draft → submitted` (`submission.php` sets `umgpc_status` + `umgpc_submitted_at`). This is a better UX and already done.
- Fields are photo-contest-specific (division, dob, school, grade, student proof, consents) rather than the generic "art submission" fields in the doc.

### Flow 2 — Admin / Judge Dashboard: NOT STARTED

Evidence of absence:
- No `apps/umg/app/admin/` route at all; no `/admin/submissions` or `/admin/submissions/[id]`.
- No judge-facing endpoints: there is **no** `GET /umg/v1/submissions`, `GET /umg/v1/submissions/{id}`, or `POST /umg/v1/submissions/{id}/judge` (grep of `includes/` shows only auth, draft, submission-finalize, payment, cors, cleanup, post-types, jwt, config).
- No score/notes/ranking meta model beyond `umgpc_status`. Today, submissions are reviewed only through **wp-admin** (`post-types.php` sets `show_ui => true`, `show_in_rest => false`).
- `judges-panel/page.tsx` is public bios, not a review tool.

Implementation breakdown (Flow 2):
- **Backend (new `includes/judging.php` in the plugin):**
  - `GET /umg/v1/submissions` — auth + judge-role required; list submitted entries, filterable by `division`/`status`; return per-entry summary. Reuse `umgpc_get_user_from_request` + a new role check.
  - `GET /umg/v1/submissions/{id}` — single entry detail incl. photos (Media Library URLs), applicant data, existing scores.
  - `POST /umg/v1/submissions/{id}/judge` — save this judge's scores against the six `evaluationCriteria` already defined in `current.ts`, plus notes. Store as post meta keyed by judge id (e.g. `umgpc_scores_{userId}`) so multiple judges are independent and auditable.
  - Add statuses/rankings to the CPT meta (`reviewed`, `winner`, `rejected`) — the doc's status set.
- **Frontend (UMG):** `apps/umg/app/admin/submissions/page.tsx` (filterable list) and `apps/umg/app/admin/submissions/[id]/page.tsx` (scoring form driven by `currentCompetition.evaluationCriteria` and `divisionJudgingNotes`, both already in config). Reuse `useAuth`/`api.ts` patterns; add score-fetch/save calls to a new `apps/umg/lib/auth/api.ts` section or a sibling `lib/judging/api.ts`.
- **Key decisions:** (a) scoring model = per-judge meta then aggregate, vs. single shared score — recommend per-judge for fairness/audit; (b) whether judges see applicant identity or a blind view; (c) locking entries once `submitted`.

**Relation to custom-backend migration:** the public flow is done and stable in WP — leave it. The judging dashboard is squarely one of the "new features enabled" by the custom backend (`custom-backend-plan.md`: "Judging panel — auth with judge roles, scoring, audit logs"). It's needed **before Sept–Oct 2026 Jury Review** (per `current.ts` timeline), which is **well before** any realistic backend migration. **Build judging in the existing WP plugin now**; port later if/when the backend moves.

---

## 3. Payment / Donation System

**One-line:** Accept payments/donations on UMG.

**Status: PARTIALLY BUILT** — contest **entry-fee** payment is built (Option A + a webhook); general **donation** system is not.

Evidence:
- Stripe **Payment Link** (the doc's "Option A"): `apps/umg/lib/competitions/current.ts` → `stripePaymentLink: "https://buy.stripe.com/..."`.
- Server-side settlement beyond a bare link (partial "Option C"): `docs/plugin/umg-photo-contest/includes/payment.php` — `GET /umg/v1/payment-status` and a signature-verified `POST /umg/v1/stripe-webhook` that marks the user `paid` (handles both immediate cards and async methods like Alipay, with replay protection).
- Payment status surfaced to the frontend on the `User` object (`payment_status: "unpaid" | "paid"` in `lib/auth/types.ts`).

Gaps vs. doc: no general/recurring **donation** form or custom-amount PaymentIntent flow (`POST /umg/v1/create-payment` does not exist). Only the fixed entry fee is wired.

Implementation breakdown (if donations are wanted): start with a second Stripe **Payment Link** (or Checkout, "Option B") embedded on a `/donate` or about page — zero backend, works with static export. Upgrade to custom amounts (Option C) only if needed, reusing the existing webhook-verification pattern in `payment.php`.

**Relation to custom-backend migration:** payments are listed as a migration-enabled feature (`transactions` table), but Stripe Payment Links are backend-agnostic. **Any donation add is build-now, defer-nothing** — no dependency on the migration.

---

## 4. Custom Post Editor — EM & IS

**One-line:** Replace wp-admin with a custom in-site rich-text editor + article-management dashboard for Echo Media and International Spectrum, with layout variations, custom meta flags, drafts/auto-save/revisions, and editorial workflow.

**Status: NOT STARTED.**

Evidence of absence:
- No `editor` directory anywhere under `apps/` (searched all three apps).
- No rich-text editor dependency (no TipTap/ProseMirror/Plate) in the monorepo packages.
- `packages/ui` contains article/section/header/footer components only — no editor components.
- No `/editor`, `/editor/[id]`, `/editor/drafts`, `/dashboard` routes on EM or IS.

Implementation breakdown (large; multi-phase):
- **Prerequisite:** shared auth. Extract the UMG `AuthContext`/`api.ts` pattern into `packages/ui` (or a new `packages/auth`) so EM/IS reuse it. Requires JWT + author/editor/admin roles on the EM and IS WP instances (mirrors the UMG plugin's `jwt.php`/`auth.php` approach).
- **Editor:** add **TipTap** to the monorepo; build editor components in `packages/ui` (shared by EM+IS). Output HTML → WP `post_content`, rendered by the existing `prose` (`@tailwindcss/typography`) setup used in `packages/ui/article/ArticleLayout.tsx`. Only embeds/iframes and task lists need extra CSS.
- **Layout variations:** store `article_layout` post meta; `ArticleLayout` switches on it to pick a variation component in `packages/ui`. Register the meta with `show_in_rest` in each site's WP plugin (pattern already exists — `is-headless-config.php` registers `video_url` meta the same way).
- **Custom flags:** `show_author_bio`, `is_featured`, `highlight_color`, etc. as post meta, each: editor control → REST save → frontend read.
- **Dashboard:** `/dashboard` table with filter/search/sort/bulk/pagination using standard `GET /wp/v2/posts?status=any&per_page=&page=`, `DELETE /wp/v2/posts/{id}`, `POST /wp/v2/posts/{id}`. Role-based visibility (author sees own; editor/admin see all).
- **Drafts / auto-save / revisions:** native WP draft status, `PUT /wp/v2/posts/{id}` on interval, `GET /wp/v2/posts/{id}/revisions`.
- **Editorial workflow:** Draft → Pending Review → Published, with the existing rebuild webhook firing on publish.

**Relation to custom-backend migration:** This is the **highest-overlap, highest-risk item to build in WP** — it's a big investment in wp-admin-replacement UI and WP meta plumbing that a custom backend would rearchitect (single Postgres `articles` table, real-time, no rebuild). **Recommendation: defer or build thin.** If content velocity forces it before migration, build the editor UI against the WP REST API but keep the data contract clean so it survives the backend swap. This is also the doc's own step 2 in implementation order, gated on the shared auth system.

---

## 5. Social Media Auto-Post & Image Generation

**One-line:** On publish, auto-generate a social card image (gradient + title overlay) and post to Instagram (later X/FB/LinkedIn), driven by editor flags.

**Status: NOT STARTED.**

Evidence of absence: no editor exists to carry the `post_to_ig` / `social_*` flags (see §4); no social/IG handler in any plugin under `docs/plugin/`; no image-generation (GD/Imagick) code.

Implementation breakdown:
- **Depends on §4** (editor flags: `post_to_ig`, `social_title`, `social_caption`, `social_image_override`, `social_hashtags`).
- WP plugin handler on `publish_post`: detect flag → generate card with **GD/Imagick** (load featured image, black gradient bottom 30%, white title via `imagettftext`, optional logo, save to Media Library) → post via **Instagram Graph API**.
- Requirements: IG Business/Creator account + linked FB Page + Meta Developer App (`instagram_content_publish`), long-lived token in WP options, 25 posts/24h limit, publicly reachable image URLs.
- Editor shows a live CSS preview of the card before publish.
- Start Instagram-only; other platforms are additional flag-triggered handlers.

**Relation to custom-backend migration:** Prereqs (server-side image gen, PHP GD/Imagick) are WP-specific. In a custom backend this becomes a Node image pipeline (sharp/canvas) + queue. **Defer** — lowest priority (doc's step 4), depends on the editor, and is the least reusable across the migration.

---

## Echo Media Category Overhaul (`em-category-overhaul.md`)

**One-line:** When EM finalizes a new category list, propagate it across the frontend config, homepage section map, WP, and the UMG ingestor. **Reference-for-later, currently BLOCKED on the new category list being decided.**

Mechanical steps (in order):
1. **WP (source of truth):** create new categories in EM wp-admin, reassign articles, delete/merge old ones.
2. **`apps/echo-media/lib/categories.ts`:** update names/slugs/colors. Slugs **must exactly match** WP slugs — `getCategoryId()` in `packages/api/wp-client.ts` resolves IDs at runtime via `GET /wp/v2/categories?slug={slug}`. If >4 categories, adjust the nav split (`mainCategories` / `lgOnlyCategories` / `moreCategories`).
3. **`apps/echo-media/app/page.tsx`:** update `SECTION_TYPE_MAP` (type1–4). No manual section add/remove — the page maps over `categories` and renders one `CategorySectionWrapper` per entry automatically (unmapped slugs fall back to `type1`).
4. **Category pages** (`app/category/[slug]/page.tsx`): no change — `generateStaticParams()` reads `categories.ts` dynamically.
5. **Header/Footer:** no change — categories flow through from `categories.ts`.
6. **Article pages** (`app/articles/[slug]/page.tsx`): no change — `categoryColorMap` is derived from `categories.ts`.
7. **UMG ingestor** (`docs/plugin/united-media-ingestor/includes/mapping.php`): update `um_source_category_map()`, `um_category_children_spec()`, and/or `um_excluded_source_categories()`.
8. **Flush & re-ingest UMG DB:** clear old ingested EM articles, re-run full ingest (EM's own frontend needs no flush — runtime lookup).

Optional bundled item: **video interview support for EM** (register `video_url` meta + meta box like `is-headless-config.php:26-61`; add one `videoUrl={article.video_url}` prop in EM's article page — shared code in `packages/api/wp-client.ts` and `packages/ui/article/ArticleLayout.tsx` already handles rendering + YouTube thumbnail fallback).

**Blocker:** prerequisites are (a) the new category list (names + colors) from the EM team, (b) categories created in WP first, (c) articles reassigned before re-ingest. Nothing to build until (a) lands.

**Relation to custom-backend migration:** purely a WP/frontend-config change; the runtime slug lookup means it's low-risk and orthogonal to the migration. Do it whenever the list is ready.

---

## Status Table

| # | Feature | Status | Build now vs. defer | Effort |
|---|---------|--------|---------------------|--------|
| 1 | User Auth & Admin Login | **Partial** — submitter email-code JWT built (`lib/auth/*`, plugin `auth.php`/`jwt.php`); no judge/admin roles, no `/login` or `/admin/*` | Build now in WP (needed for judging) | S–M (roles + admin login surface) |
| 2a | Art Submission — public flow | **Already built** (live photo contest: `photo-submission/*`, `lib/competitions/*`, plugin `draft.php`/`submission.php`/CPT) | Done — maintain only | — |
| 2b | Art Submission — judge/admin dashboard | **Not started** (no `/admin/submissions`, no judging endpoints/scores) | Build now in WP (before Sep–Oct 2026 jury review) | M |
| 3 | Payment / Donation | **Partial** — contest entry fee via Stripe Payment Link + webhook (`payment.php`, `current.ts`); no general donation | Build now if wanted (Payment Link, no backend) | XS |
| 4 | Custom Post Editor (EM/IS) | **Not started** (no editor routes, no TipTap) | Defer / build thin — heavy WP overlap with migration | XL |
| 5 | Social Auto-Post & Image Gen | **Not started** (depends on editor) | Defer — lowest priority, WP-specific | L |
| — | EM Category Overhaul | **Not started, BLOCKED** on new category list | Do when list is ready (WP + `categories.ts` + ingestor) | S (mechanical) |

Effort key: XS < S < M < L < XL.
