# umg-photo-contest/includes — overview

The ten include files of the photo competition plugin: constants/CORS, the `umg_submission` CPT, a dependency-free HS256 JWT layer, passwordless email-code auth, Stripe payment tracking, draft CRUD with media uploads, final submission, school/bulk-registration CRUD, and a weekly cleanup cron.

## Contents
| Item | Type | Summary |
|------|------|---------|
| [config.php](config.php.md) | file | JWT secret/expiry, auth-code expiry, Stripe webhook secret, allowed CORS origins |
| [cors.php](cors.php.md) | file | OPTIONS preflight + origin-whitelisted CORS for the whole `umg/v1` namespace; REST no-cache headers |
| [post-types.php](post-types.php.md) | file | Non-public `umg_submission` CPT (wp-admin "Photo Contest" menu) used as the data store |
| [jwt.php](jwt.php.md) | file | HS256 generate/validate + `umgpc_get_user_from_request()` — the auth guard for every protected route |
| [auth.php](auth.php.md) | file | `POST /auth/request-code`, `POST /auth/verify-code`, `GET /me` — email-code login, implicit user creation, JWT minting |
| [payment.php](payment.php.md) | file | `GET /payment-status` (JWT) and `POST /stripe-webhook` (signature-verified) marking users paid |
| [draft.php](draft.php.md) | file | Draft CRUD: `GET/PUT /draft`, photo upload/delete (max 3 JPEGs), student-proof upload/delete |
| [submission.php](submission.php.md) | file | `POST /submit` — flips the draft to `submitted` and timestamps it |
| [school.php](school.php.md) | file | School/bulk-registration CRUD: many independent applications per account, `GET/POST /school/applications`, `GET/PUT/DELETE /school/application/{id}`, photo upload/delete, `POST .../submit` |
| [cleanup.php](cleanup.php.md) | file | Weekly cron deleting 90-day-stale never-submitted drafts and their photos |

## Connections
```mermaid
graph LR
  auth[auth.php] --> jwt[jwt.php]
  auth --> config[config.php]
  payment[payment.php] --> jwt
  payment --> config
  draft[draft.php] --> jwt
  draft --> cpt[post-types.php]
  submission[submission.php] --> jwt
  submission --> draft
  school[school.php] --> jwt
  school --> cpt
  school -.reuses helpers.-> draft
  cleanup[cleanup.php] --> draft
  cleanup --> cpt
  jwt --> config
  cors[cors.php] --> config
  payment --> stripe[(Stripe webhooks)]
  auth --> mail[(wp_mail)]
```

## Entry points
- Loaded by [../umg-photo-contest.php](../umg-photo-contest.php.md) in order: config → cors → post-types → jwt → auth → payment → draft → submission → school → cleanup.
- REST routes (namespace `umg/v1`): public `POST /auth/request-code`, `POST /auth/verify-code`, `POST /stripe-webhook` (Stripe signature); Bearer-JWT `GET /me`, `GET /payment-status`, `GET/PUT /draft`, `POST /draft/photo`, `DELETE /draft/photo/{id}`, `POST /draft/student-proof`, `DELETE /draft/student-proof`, `POST /submit`, `GET/POST /school/applications`, `GET/PUT/DELETE /school/application/{id}`, `POST /school/application/{id}/photo`, `DELETE /school/application/{id}/photo/{mediaId}`, `POST /school/application/{id}/submit`. All consumed by [apps/umg/lib/auth/api.ts](../../../apps/umg/lib/auth/api.ts.md) (school routes not yet consumed — frontend pending, see [school.php](school.php.md)).
- Cron hook: `umgpc_cleanup_orphaned_drafts` (weekly, scheduled by the bootstrap's activation hook).

---
*Documented at commit 62e1c78.*
