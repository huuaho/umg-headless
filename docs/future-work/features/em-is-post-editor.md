# EM / IS Custom Post Editor — Implementation Plan

> Intent: an in-site rich-text article editor + management dashboard for Echo Media and International Spectrum, so authors create/edit posts without ever opening wp-admin.

**Status: NOT STARTED.** Verified against the codebase — there are no editor routes, no rich-text editor dependency, and no author auth on the EM/IS WordPress instances.

**Effort: XL.** This is the single largest item in `future-features-breakdown.md` (§4) and the one with the heaviest overlap with the custom-backend migration.

---

## 1. Overview & why this is large

The ask is effectively to **rebuild the authoring half of a CMS** as a headless SPA. It is not one feature; it is a stack of features that each depend on the previous one:

- An **authenticated app shell** on two sites that today have *no auth at all* (see §3).
- A **rich-text editor** (TipTap/ProseMirror) producing WP-compatible HTML.
- **Draft / auto-save / revisions** wired to the WP REST API.
- **Media upload** into the WP Media Library from the browser.
- A **management dashboard** (list, filter, search, sort, bulk actions, pagination, role-based visibility).
- **Layout-variation and custom-flag meta** plumbed end-to-end (editor control → REST → frontend render).
- A **publish workflow** (Draft → Pending Review → Published) that triggers the existing rebuild.

Two structural facts from the real code make this bigger than it looks:

1. **EM and IS are fully static exports.** Both `apps/echo-media/next.config.ts` and the IS equivalent set `output: "export"` in production. There is no server runtime, no API routes, no middleware. Every editor page must ship as a **static empty shell** that authenticates and loads/saves data **client-side** against WordPress — exactly the model UMG's `photo-submission` already uses. You cannot lean on Next.js server actions or route handlers here.
2. **Content today flows one way: WP → frontend.** `packages/api/wp-client.ts` reads `wp/v2/posts` (read-only, unauthenticated) and renders through `packages/ui/article/ArticleLayout.tsx`. The editor is the **inverse** data path (authenticated writes back to WP) and shares almost none of the existing fetch code beyond types.

---

## 2. The central decision: build now vs. wait for the custom backend

**This feature is migration-adjacent and should almost certainly be scoped INTO the custom backend, not built standalone in WP first.**

Why the overlap is severe (`custom-backend-plan.md`):
- The custom backend is planned as a single Postgres `articles` table with **real-time content (no rebuild)** and its own auth/roles. A WP-first editor is a large investment in **WP-meta plumbing, the WP REST write API, WP revisions, and a rebuild-on-publish webhook** — every one of which the migration explicitly throws away.
- A WP-first editor would be **re-architected, not ported**: TipTap HTML in `post_content` becomes a DB text column; `register_post_meta` flags become table columns; `GET /wp/v2/posts/{id}/revisions` becomes a revisions table; the `repository_dispatch` rebuild disappears entirely.

Why we still can't fully defer:
- Articles **currently originate in WordPress**, and wp-admin already works. The *only* thing missing is a nicer authoring UI. So the honest framing is: **there is no urgent functional gap** — authors can publish today via wp-admin. The editor is an ergonomics/branding upgrade, not a capability unlock (unlike the UMG judging dashboard, which has a hard Sept–Oct 2026 deadline and no WP-admin substitute).

**Recommendation (pragmatic path):**

- **Default: DEFER the full editor.** Fold it into the custom-backend build so it's written once, against Postgres, with real-time publishing. Do not build the heavy WP-first version.
- **Interim option if content velocity demands a better authoring UX before migration (see §9):** ship a *thin* editor — TipTap + featured-image upload + draft/publish only — and deliberately **skip** revisions UI, bulk dashboard actions, layout variations, and custom flags. Keep the data contract clean (plain HTML + a minimal, documented meta set) so the migration can re-home it cheaply.
- **Do NOT build:** social auto-post flags (`future-features-breakdown.md` §5) or elaborate layout-variation machinery until the backend decision is made — those compound the throwaway work.

The steps below (§4–§8) describe the **full build** for completeness. If the interim path is chosen, build only §3, §4, §5 (featured image only), §7 (draft + publish, skip revisions), and the minimal dashboard in §8 — explicitly deferring layout variations, custom flags, bulk actions, and preview polish.

### 2.1 Why not WordPress — the full argument (decided 2026-07-04)

Recorded after the backend-migration deep-dive
([`../custom-backend-architecture.md`](../custom-backend-architecture.md)).
Five reasons, descending weight:

1. **Everything a WP editor is built on is exactly what the migration throws
   away.** An editor is an investment in a persistence layer: TipTap HTML into
   `post_content`, layout flags via `register_post_meta`, drafts/revisions
   through `wp/v2/posts` semantics, publish → `repository_dispatch` rebuild.
   Post-migration, each becomes a Postgres column, a revisions table, or an
   on-demand revalidate call. It would be **rearchitected, not ported** — the
   XL effort spent twice.
2. **It doubles the security surface the payment-pipeline audit condemned.**
   EM/IS WordPress have no auth at all today (their plugins are CORS + rebuild
   webhook only). A WP editor means porting UMG's hand-rolled JWT
   (`jwt.php`/`auth.php`) to two more installs — the same stack whose deferred
   items (brute-forceable codes, localStorage tokens; I-6/I-10) are the
   migration's strongest justification — and these accounts carry **publish
   rights**, so token theft = publishing as staff. Standing up new privileged
   auth on the stack already judged a liability is the wrong direction.
3. **The platform fights it.** EM/IS are static exports — no server runtime.
   Every editor route is an empty client shell doing authed browser calls:
   multipart uploads to `wp/v2/media` through CORS preflights, autosave over a
   REST API designed for wp-admin cookie auth. Possible (photo-submission
   proves the pattern), but it puts the most interactive surface in the
   project on the stack least suited to it — vs. Next.js + Supabase where
   auth, storage upload, and RLS-scoped writes are the paved road.
4. **The economics invert for this feature specifically.** The judge panel was
   *correctly* built on WP: hard Sept 1 deadline, M-sized, data already in WP.
   The editor is the mirror image: **no deadline** (wp-admin works — zero
   functional gap), **XL-sized** (largest roadmap item), greenfield data
   model. For the judge panel WP was the cheap fast path; for the editor WP is
   the expensive slow path to a throwaway.
5. **The editor is not just a feature — it's the migration trigger.** Once
   EM/IS authors write into Postgres, their articles are native rows:
   two-thirds of the ingestor (EM/IS pull loops, cursors, dedup) is deleted,
   only the DW import survives, UMG aggregation becomes a plain query, and the
   shared auth/roles the end-state needs exist because the editor forced them.
   Built on WP, the editor **delays** the migration by sinking effort into the
   old stack; built on Postgres, it **is** the migration's phase 4 and drags
   phases 1–2 along. Same feature, opposite strategic effect.

**Standing decision:** if the client funds this editor, that funding is the
migration's starting gun — build it natively on the custom backend, never on
WP. The "interim thin WP editor" path in §2 remains documented only for the
case where migration is explicitly ruled out *and* authoring friction is a
stated, recurring pain — and even then, reconfirm against this section first.

---

## 3. Prerequisite — author auth on EM & IS (does not exist today)

Verified: the EM/IS WordPress instances run only `docs/plugin/em-headless-config.php` and `docs/plugin/is-headless-config.php` (CORS + rebuild webhook + `video_url` meta + author-name REST field). There is **no JWT, no login endpoint, no custom roles** — all of that lives only in the UMG `umg-photo-contest` plugin.

Steps:

1. **Port the UMG JWT mechanism to EM & IS.** Extract `docs/plugin/umg-photo-contest/includes/jwt.php` (`umgpc_*_jwt`, `umgpc_get_user_from_request`) and an auth surface into a small shared plugin, e.g. `docs/plugin/um-headless-auth/` installed on both sites. For editors, use **username/password** (`POST /{ns}/v1/auth/login`) rather than the submitter email-code flow — authors are known staff, not the public.
2. **Register roles/capabilities.** `author` (own posts, submit for review), `editor` (all posts, publish), `admin` (everything). A WP `edit_posts`/`publish_posts` capability check gates every write endpoint.
3. **Reuse the frontend auth pattern, don't reinvent it.** Lift `apps/umg/lib/auth/{AuthContext.tsx,api.ts,types.ts}` into a shared location (`packages/auth/` or a `packages/ui` submodule) so EM and IS both consume `useAuth()`. **Security upgrade for privileged accounts:** move the token from `localStorage` to an httpOnly cookie (XSS matters far more for publish rights than for a submitter draft).
4. **CORS:** the allow-lists in the two `*-headless-config.php` files already cover the site origins; confirm `Authorization` is permitted on preflight for the write endpoints.

New/changed files:
- `docs/plugin/um-headless-auth/` (new shared plugin: `jwt.php`, `auth.php`, `roles.php`).
- `packages/auth/` (new) or shared under `packages/ui` — extracted from `apps/umg/lib/auth/*`.

---

## 4. Editor stack & routes

**Stack: TipTap** (headless ProseMirror wrapper). It outputs standard HTML that the existing `prose` / `@tailwindcss/typography` setup in `ArticleLayout.tsx` already renders, so authored posts render identically to wp-admin posts. Add `@tiptap/react`, `@tiptap/starter-kit`, plus extensions for links, images, tables, and embeds.

Build the editor **once in `packages/ui`** so EM and IS share it:

- `packages/ui/editor/RichTextEditor.tsx` — TipTap instance + toolbar.
- `packages/ui/editor/EditorToolbar.tsx` — bold/italic/heading/list/quote/link/image/embed controls.
- `packages/ui/editor/PostForm.tsx` — title, slug (auto from title, editable), excerpt, featured image, category/tags, status, and the layout/flag controls (§6).
- `packages/ui/editor/index.ts` — barrel export; add to `packages/ui/index.ts`.

Routes (identical set per site, as static client shells — `apps/echo-media/app/...` and `apps/international-spectrum/app/...`):

- `editor/login/page.tsx` — author login (uses shared `useAuth`).
- `editor/layout.tsx` — client-side auth+role guard; redirects to `editor/login` when no valid token.
- `editor/page.tsx` — create new post.
- `editor/[id]/page.tsx` — edit existing post (loads via authenticated `GET /wp/v2/posts/{id}?context=edit`).
- `editor/drafts/page.tsx` — author's drafts list.
- `editor/preview/[id]/page.tsx` — render current draft through the real `ArticleLayout` + selected layout variation (§6) before publishing.
- `dashboard/page.tsx` — management dashboard (§8).

Because both apps are `output: "export"`, each of these needs `export const dynamic = "force-static"` semantics and must not use `generateStaticParams` for `[id]` (unknown at build time) — render a static shell and read the id from the URL client-side, mirroring how `apps/umg/app/photo-submission` handles per-user data.

Frontend API client (writes): new `packages/api/wp-admin.ts` (or `lib/editor/api.ts` per app) wrapping the authenticated calls in §5/§7. Keep it **separate** from the read-only `wp-client.ts` so the public fetch path stays unauthenticated and cacheable.

---

## 5. Media / image handling

- **Featured image + inline images upload straight to the WP Media Library** (the doc's Option A): `POST /wp/v2/media` (multipart, `Authorization: Bearer …`), then attach the returned media id as `featured_media` on the post, or insert the `source_url` into the TipTap document for inline images.
- A TipTap image extension handles inline insertion; galleries reuse the existing frontend gallery rendering (the read path already resolves gallery ids in `wp-client.ts` via `resolveMediaIds`).
- **Migration note:** in the custom backend this becomes a Cloudinary/S3 signed-upload flow (`custom-backend-plan.md`). Keep the upload call behind the `wp-admin.ts` client so only that one function changes later.

---

## 6. Layout variations & custom flags (defer in the interim build)

- Store as post meta, following the **existing `video_url` pattern** in `is-headless-config.php` (`register_post_meta('post', …, show_in_rest => true)`):
  - `article_layout` (`"standard" | "magazine" | "minimal"`), `show_author_bio`, `is_featured`, `highlight_color`, etc.
- Each variation is a component in `packages/ui/article/` that `ArticleLayout.tsx` switches on via the meta value — so **frontend read support and the editor control are the same meta field** end-to-end.
- Editor exposes these as `PostForm` controls (dropdown, toggles, color picker) that write the meta on save.
- This is the most throwaway-prone piece under migration (WP meta → DB columns), so it's the first thing to cut for the interim build.

---

## 7. Draft storage, auto-save, revisions

All native WP REST, all authenticated:

- **Create/draft:** `POST /wp/v2/posts` with `{ status: "draft" }`.
- **Auto-save:** debounced `POST /wp/v2/posts/{id}` (WP treats POST-to-existing as update) on a ~20–30s interval and on blur; surface a "Saving…/Saved/Unsaved" indicator in the editor chrome.
- **Revisions:** `GET /wp/v2/posts/{id}/revisions` for history; optional restore. **Cut this from the interim build** — it's pure WP-revision machinery the backend replaces.
- Draft/meta contract must be documented so the migration can map it to Postgres columns.

---

## 8. Publish workflow & dashboard

**Workflow:** Draft → Pending Review → Published, via `status` on `POST /wp/v2/posts/{id}`. Role gating from §3: `author` can set `pending`, `editor`/`admin` can set `publish`. **Publishing reuses the existing rebuild** — `em-headless-config.php` / `is-headless-config.php` already fire a `repository_dispatch` (`GH_REBUILD_TOKEN`, `event_type: deploy-echo-media` / `deploy-international-spectrum`) on publish/update/delete, so no new deploy plumbing is needed.

**Dashboard** (`dashboard/page.tsx`): table of title / author / category / status / layout / date / actions, backed by `GET /wp/v2/posts?status=any&context=edit&per_page=&page=` with filter (status/category/author/date), search, sort, pagination (native `X-WP-Total*` headers), delete (`DELETE /wp/v2/posts/{id}`, `?force=true` for permanent), and bulk actions. Role-based visibility: authors see own posts, editors/admins see all. **Interim build:** ship list + filter + edit/delete only; defer bulk actions and sort.

---

## 9. Effort, dependencies, and decision gate

**Effort: XL** (full build). Interim thin build ≈ **L**.

Dependencies (in order):
1. **Author auth on EM & IS (§3)** — hard blocker; nothing exists today. Depends on porting the UMG JWT plugin and extracting the shared frontend auth.
2. Shared editor components in `packages/ui` (§4).
3. Writable API client separate from `wp-client.ts` (§4/§5/§7).
4. Static-export constraint (§1) governs every route — no server runtime available.
5. **Social auto-post (`future-features-breakdown.md` §5) depends on this editor** for its flags — but should not be built here.

**Decision gate before writing any code:** confirm whether the custom-backend migration is going ahead in a timeframe that makes a WP-first editor throwaway.
- If migration is **committed/near** → **do not build the WP editor**; specify the editor as part of the backend and keep using wp-admin until then.
- If migration is **indefinite** *and* authoring friction is a real, stated pain → build the **interim thin editor** (§2), scoped tightly and with a clean data contract.
- Absence of a hard deadline (unlike UMG judging) is why the reconciliation marks this **defer / build thin**.
