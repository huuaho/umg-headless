# Social Profiles Rollout (Ticket 13)

> Establish/claim consistent UMG social profiles and wire the confirmed URLs into the site's Footer, Organization `sameAs` schema, and `rel="me"` verification chain so AI/search crawlers can bind them to one entity.

## Overview

Ticket 13 is **mostly a non-code, social-team task** (owner: Allison/social team) with a **small, blocked code tail**. The value for AEO is a *bidirectional, consistent* identity chain: the site asserts which profiles it owns (`sameAs` + `rel="me"`), and each profile links back to `unitedmediadc.com`/Linktree. Consistency of name/bio/avatar across platforms is what lets ChatGPT/Perplexity/Google resolve the profiles to a single organization entity.

This document splits the work into two tracks:

- **NON-CODE (social team, no dependency, can start now):** create/claim profiles, set consistent handles, names, bios, categories, avatars, and website fields; convert Linktree links to HTTPS.
- **CODE (dev, BLOCKED until profile URLs/handles are confirmed):** reflect the confirmed profile URLs in three places in the repo. These already exist and are wired for X + Instagram; the code work is only to reconcile/extend them once the social team finalizes the official set.

### What the code already does today (verified)

- `apps/umg/app/layout.tsx` Footer `socials` prop (lines ~121–124) passes `x` → `https://x.com/unitedmedia_dc` and `instagram` → `https://www.instagram.com/unitedmediagroupdc/`.
- Same file, `organizationSchema.sameAs` (lines ~79–82) lists exactly those two URLs, with an inline comment: *"sameAs must stay in sync with the Footer socials below."*
- `packages/ui/Footer.tsx` renders each social anchor with `rel="me noopener noreferrer"` in **both** layout variants (lines ~156 and ~240) — the `rel="me"` half of the verification chain is done (ticket x-06, verified 2026-06-12).
- `packages/ui/Footer.tsx` `socialIcons` map (line ~29) only defines icons for **`x`** and **`instagram`**. Any new platform key (facebook, linkedin, tiktok, youtube, linktree) renders **no icon** unless an SVG is added.
- The canonical `SITE_DESCRIPTION` in `apps/umg/app/layout.tsx` (lines ~31–32) is the same sentence the social bios must mirror — the schema `description` and social bios must not drift apart.

So the code side is **not greenfield**: X + Instagram are already wired end-to-end. The remaining code work only triggers if the social team (a) confirms the two existing handles are official/unchanged (then: no-op, just verify), (b) changes a handle, or (c) adds a new official platform (e.g. Linktree, Facebook, TikTok).

---

## Decisions needed (block the code work)

The dev steps below cannot start until the social team answers:

1. **Which platforms are official `sameAs` members?** Today only X + Instagram are in `sameAs`. Decide whether Linktree (`unitedmediagroup196`), and any future Facebook/TikTok/YouTube/LinkedIn, should be added. `sameAs` should list **profile pages the org owns**, not aggregators — decide explicitly whether the Linktree URL belongs in `sameAs` (it is a valid owned profile, but a hub, not a platform account).
2. **Are the current handles final?** `@unitedmedia_dc` (X) and `@unitedmediagroupdc` (Instagram) are live in code. The ticket flags handle fragmentation (5 different handles). If any handle is renamed as a brand decision, the URLs in `layout.tsx` (both the `socials` prop and `sameAs`) must be updated in lockstep.
3. **Linktree HTTPS + link-back.** Every Linktree link must be HTTPS and return 200, and profiles must link back to `unitedmediadc.com` (or the Linktree, which links to the site) to complete the bidirectional chain. This is a social-team action but gates the validation step.
4. **Prize phrasing in bios.** Use the site's own per-division prize phrasing from `apps/umg/lib/competitions/current.ts` — **not** the spec's "$8K". Social-team-owned, but noted here because bios must stay consistent with on-site copy.

---

## CODE steps (dev — blocked until Decisions 1–2 are confirmed)

All changes are UMG-only and live in two files. Do nothing until the social team returns the confirmed, final list of official profile URLs.

1. **Confirm or update the existing URLs.** In `apps/umg/app/layout.tsx`, compare the confirmed handles against the two URLs already present in the `socials` prop (lines ~121–124) and `sameAs` (lines ~79–82). If unchanged, this is a no-op verification. If a handle changed, update the URL in **both** places.

2. **Add any newly-confirmed platform to `sameAs`.** In `apps/umg/app/layout.tsx`, extend the `organizationSchema.sameAs` array (lines ~79–82) with the confirmed URL(s), e.g. the Linktree URL and/or a Facebook page. Keep it to owned profiles per Decision 1.

3. **Add the same platform to the Footer `socials` prop.** In `apps/umg/app/layout.tsx`, add a `{ platform, url }` entry to the `socials` array (lines ~121–124) so `sameAs` and the Footer stay in sync (the inline comment on line ~63 requires this).

4. **If a new platform key is introduced, add its icon.** In `packages/ui/Footer.tsx`, add an SVG to the `socialIcons` map (line ~29) for any new platform key (e.g. `facebook`, `tiktok`, `linktree`). Without this, the anchor renders but shows no icon. Shared package — EM/IS inherit it but are unaffected until they pass `socials`.

5. **`rel="me"` — already done, just verify.** No change needed: `packages/ui/Footer.tsx` already emits `rel="me noopener noreferrer"` on both layout variants. Re-confirm after any social edit (step below).

6. **Keep bios ↔ schema description consistent.** If the canonical description changes as part of this rollout, update `SITE_DESCRIPTION` in `apps/umg/app/layout.tsx` (lines ~31–32) and the social bios together so the schema `description` and the platform bios do not diverge.

---

## Social-team checklist (NON-CODE — no dependency, start now)

Per the ticket's platform actions:

- [ ] **Instagram (@unitedmediagroupdc):** Name → "United Media Group | DC"; bio per ticket (with per-division prize phrasing from `current.ts`, not "$8K"); category → Media/News Company; website field → Linktree over HTTPS.
- [ ] **X (@unitedmedia_dc):** Name → "United Media Group"; bio per ticket; location → "Washington, DC"; URL → Linktree HTTPS.
- [ ] **Linktree (unitedmediagroup196):** header description = canonical sentence; convert all links HTTP → HTTPS; competition entry link at position 1, featured/starred.
- [ ] **Consistency pass:** same avatar/logo, name treatment, and canonical description (within each platform's length limit) across all profiles.
- [ ] **Link-back:** each profile's website/bio links to `unitedmediadc.com` or the Linktree (which links to the site) — completes the bidirectional chain with `rel="me"`/`sameAs`.
- [ ] **Confirm the official set** and hand the final profile URLs to dev to unblock the code steps.

---

## Testing

Non-code (social team):
- [ ] All three platforms show updated name/bio/category/URL fields.
- [ ] Bio/description language matches the canonical sentence within platform limits.
- [ ] Every Linktree link is HTTPS and returns 200.
- [ ] One month later: ask ChatGPT/Perplexity "Who is United Media Group?" and record whether the answer matches the canonical description (spec §9 tracking sheet).

Code (after any dev change):
- [ ] View-source on `/`: each confirmed profile anchor is present with `rel="me noopener noreferrer"` (check **both** footer layout variants — mobile + desktop).
- [ ] `organizationSchema.sameAs` in the rendered JSON-LD lists **exactly** the confirmed official profile URLs and matches the Footer `socials` entries (no drift).
- [ ] Any new platform renders its icon (`socialIcons` has a matching key).
- [ ] `pnpm turbo run build --filter=umg` passes; grep `rel="me` in `apps/umg/out/index.html` shows the expected match count (2 per profile across the two layout variants).
- [ ] EM/IS builds unaffected: `pnpm turbo run build --filter=echo-media --filter=international-spectrum`.
- [ ] Validate the Organization schema in the schema.org validator / Google Rich Results Test — `sameAs` resolves to live 200 profiles.

---

## Effort & dependencies

- **Social team (non-code):** ~1 hr to update the three profiles + a monthly tracking check. **No dependency — start immediately.**
- **Dev (code):** ~15–30 min if only verifying/adjusting the two existing URLs; +~30 min if adding a new platform icon in `packages/ui/Footer.tsx`. **BLOCKED** until the social team confirms the final official handles/URLs (Decisions 1–2). If the answer is "the two current handles are official and unchanged," the code work reduces to a verification pass with no edits.

## Related

- Ticket: `claude-context/current-work/ongoing/13-social-profiles.md`
- AEO context / execution: `docs/future-work/remediation/aeo-remaining-work.md` (item 13)
- Completed `rel="me"` work: `claude-context/current-work/sprint-1-critical/x-06-footer-rel-me.md`
- Organization schema origin: `claude-context/current-work/sprint-1-critical/x-01-organization-schema.md`
