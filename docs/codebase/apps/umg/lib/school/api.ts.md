# apps/umg/lib/school/api.ts

**Purpose:** Fetch client for the school/bulk-registration REST endpoints (`/wp-json/umg/v1/school/*`).

## Responsibilities
Typed wrappers around the plugin's school endpoints: list/create/get/save/delete an application, submit, upload/remove a photo, and create a checkout session. Mirrors the structure of `lib/auth/api.ts` (`API_BASE`, `authHeaders`, `handleResponse`) but is a separate module rather than an extension of it, since these calls are scoped to `/school/*` and take an explicit `token` parameter instead of reading one from a shared auth context.

## Key exports
- `listApplications(token) -> ApplicationSummary[]`
- `createApplication(token) -> number` (new application id)
- `getApplication(token, id) -> ApplicationDetail`
- `saveApplication(token, id, data: SaveApplicationPayload) -> void`
- `deleteApplication(token, id) -> void`
- `submitApplication(token, id) -> void`
- `uploadPhoto(token, id, file) -> UploadApplicationPhotoResponse`
- `removePhoto(token, id, mediaId) -> void`
- `createCheckoutSession(token) -> CheckoutSessionResponse` — calls `POST /school/checkout`; the plugin resolves which applications to cover server-side (the caller's own submitted-unpaid ones), so this call takes no arguments describing the batch.

## Dependencies
- Internal: `CompetitionApiError` (reused from [../auth/api.ts](../auth/api.ts.md)), [./types](types.ts.md)
- External: `fetch`, `FormData` (photo upload)

## Used by
[apps/umg/app/school-registration/components/ApplicationsCart.tsx](../../app/school-registration/components/ApplicationsCart.tsx.md) (list/create/delete/checkout), [apps/umg/app/school-registration/components/SchoolApplicationForm.tsx](../../app/school-registration/components/SchoolApplicationForm.tsx.md) (get/save/submit/photo).

## Notes
- `API_BASE` resolves the same way as `lib/auth/api.ts`: `NEXT_PUBLIC_WP_API_URL` env var, falling back to the production WP URL — there is no separate local/school-specific backend; all school-registration testing in this repo was done directly against production (`api.unitedmediadc.com`), verified via curl and a Playwright-driven browser.
- Server-side, `POST /school/checkout` can 429 with `checkout_in_progress` if a Checkout Session for the caller's batch was created within the last 5 minutes (a duplicate-charge guard added by code review 2026-07-03 — see the plugin's `school.php` doc) — `createCheckoutSession` surfaces this like any other `CompetitionApiError`, no special handling here.

---
*Documented at commit e5821d4.*
