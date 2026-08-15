# apps/umg/app/photo-submission/components/SubmissionForm.tsx

**Purpose:** The competition entry form — draft autosave, photo/proof uploads, submission, and Stripe payment tracking. The largest component in the app (~1,460 lines).

## Responsibilities
Three views driven by draft status and payment status:

1. **Editable form** (draft): division radio (Youth / Young Adults, with [DivisionCard](../../../components/DivisionCard.tsx.md) + [PhotoRequirements](../../../components/PhotoRequirements.tsx.md) inline), personal info (first/last name, DOB, address, school, grade select, optional major), required student-proof upload (JPEG/PNG/PDF ≤ 10 MB), up to `maxPhotos` photo uploads (JPEG/JPG only, ≤ `maxFileSizeMB`, with title + word-count-limited description per photo), biography (required only for young-adults), an optional free-text **Recommender** field (name of whoever recommended the entrant; persisted in the draft as `recommender`), [CompetitionRules](../../../components/CompetitionRules.tsx.md) legal text, optional social-media consent + links, and four required consent checkboxes sourced from the competition config statements.
2. **Payment view** (submitted + unpaid): shows entry fee, a Stripe payment-link button (`stripePaymentLink` with `prefilled_email` and, when `authUser?.id` is available, `client_reference_id=<wp_user_id>` so the WP webhook can match the payer even if they pay under a different email via a wallet), a manual "check status" button, and polls `refreshUser()` every 15 s until `payment_status === "paid"`. Also offers a **"← Back to edit my submission"** button (`handleBackToEdit` → `unsubmitEntry`, `POST /unsubmit`) that reverts the entry to draft and returns to view 1 — the entry stays editable until payment completes; the helper text tells the user they must resubmit afterwards. Errors surface as `unsubmitError`.
3. **Complete view** (submitted + paid): read-only recap of division, personal info, proof, photos, biography, recommender (if set), consents, plus social links. No back-to-edit here — once paid the entry is final.

Behavior details: loads any existing server draft on mount (pre-fills all fields; `status: "submitted"` jumps straight to view 2/3); autosaves the draft 2 s after the last change (debounced, skipped while empty/submitted/loading) with "Saving…/Draft saved" feedback; photos upload immediately on selection (optimistic entry with blob preview + spinner, rolled back on failure); submit does a final `saveDraft` then `submitEntry`. Client-side validation gates the submit button (`canSubmit`).

## Key exports
- `SubmissionForm({ user, onLogout, onStepChange }) -> JSX` — `user` is `{email, name}`; `onStepChange` reports `"form" | "payment" | "complete"` to the parent's step indicator.

## Dependencies
- Internal: [lib/competitions/current](../../../lib/competitions/current.ts.md) + [types](../../../lib/competitions/types.ts.md), [lib/auth/AuthContext](../../../lib/auth/AuthContext.tsx.md), [lib/auth/api](../../../lib/auth/api.ts.md) (loadDraft, saveDraft, uploadPhoto, removePhoto, uploadStudentProof, removeStudentProof, submitEntry, unsubmitEntry), [components/DivisionCard](../../../components/DivisionCard.tsx.md), [components/PhotoRequirements](../../../components/PhotoRequirements.tsx.md), [components/CompetitionRules](../../../components/CompetitionRules.tsx.md)
- External: React; Stripe payment link (external URL)

## Used by
[photo-submission/page.tsx](../page.tsx.md) once a user is signed in. (That page currently `notFound()`s while the competition is postponed — see its doc — so this form is not reachable in production right now.)

## Notes
`"use client"`. Backend endpoints: draft CRUD ([includes/draft.php](../../../../../plugin/umg-photo-contest/includes/draft.php.md)), finalize + unsubmit ([includes/submission.php](../../../../../plugin/umg-photo-contest/includes/submission.php.md); the state flip itself lives in the plugin's `entry-state.php`, undocumented in this mirror yet), Stripe webhook flips `payment_status` ([includes/payment.php](../../../../../plugin/umg-photo-contest/includes/payment.php.md)). Gotchas: photo title/description edits are tracked for autosave via a derived `photoMetaKey` string (the autosave effect has an intentional exhaustive-deps suppression); blob preview URLs are revoked on remove/failed upload; server-side photo delete failures still remove the photo from the UI; the `job` field is labeled "Major / Concentration" in the UI. Entry fee and consent texts all come from the competition config — no amounts are hardcoded except the 10 MB student-proof limit. The submit-button footnote now says changes are allowed until payment completes (previously "final and cannot be edited"). `recommender` is optional on `DraftData` (older plugin builds omit it) but always sent in `SaveDraftPayload`. `handleCheckPayment` branches on the fresh `User` returned directly by `refreshUser()` (see [AuthContext.tsx](../../../lib/auth/AuthContext.tsx.md)) rather than the closed-over `authUser`, so it reflects the just-fetched payment status immediately instead of a stale pre-refresh render.

---
*Documented at commit bde729d.*
