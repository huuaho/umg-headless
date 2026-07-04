# apps/umg/lib/school/types.ts

**Purpose:** snake_case JSON contracts for the school/bulk-registration REST endpoints, mirroring the plugin's response shapes.

## Key exports
- `ApplicationSummary` — `{id, division, first_name, last_name, status: "draft"|"submitted", payment_status: "unpaid"|"paid"}` — the list-view shape returned by `GET /school/applications`.
- `ApplicationPhoto` — `{media_id, url, title, description}`.
- `ApplicationDetail` — full single-application shape returned by `GET /school/application/{id}`: all `ApplicationSummary` fields plus dob/address/school/grade/job/biography/photos/consents/social_links/submitted_at/payment_date.
- `SaveApplicationPayload` — the partial-upsert body for `PUT /school/application/{id}` (all fields optional).
- `UploadApplicationPhotoResponse` — `{id, url}` from `POST /school/application/{id}/photo`.
- `CheckoutSessionResponse` — `{url, application_ids, quantity, total}` from `POST /school/checkout`.

## Dependencies
None (pure type definitions).

## Used by
[./api.ts](api.ts.md) (function signatures), [apps/umg/app/school-registration/components/ApplicationsCart.tsx](../../app/school-registration/components/ApplicationsCart.tsx.md) and [apps/umg/app/school-registration/components/SchoolApplicationForm.tsx](../../app/school-registration/components/SchoolApplicationForm.tsx.md) (component state typing).

## Notes
Deliberately a separate, parallel type module from [../auth/types.ts](../auth/types.ts.md) rather than an extension of it — the school flow's `ApplicationDetail` has no `student_proof` field (waived for school applications) and tracks `payment_status`/`payment_date` per-application rather than per-user.

---
*Documented at commit e5821d4.*
