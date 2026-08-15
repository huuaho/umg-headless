# docs/plugin/umg-photo-contest/includes/auth.php

**Purpose:** Passwordless email-code authentication REST endpoints (request code, verify code, current user).

## Responsibilities
Implements the contest's login flow: find-or-create a WP user by email, email a 6-digit code, verify it, and mint a JWT. Also serves the "who am I" endpoint used to restore sessions.

## REST routes (namespace `umg/v1`)
| Method | Path | Auth | Callback |
|--------|------|------|----------|
| POST | `/auth/request-code` | Public | `umgpc_request_code` |
| POST | `/auth/verify-code` | Public | `umgpc_verify_code` |
| GET | `/me` | Bearer JWT | `umgpc_me` |

## Key exports
- `umgpc_request_code(WP_REST_Request) -> response` — validates email; creates a `subscriber` WP user if none exists (random 32-char password, username derived from the email local part, `umgpc_payment_status` meta initialized to `unpaid`); stores a 6-digit code + expiry (`UMGPC_CODE_EXPIRY`, 15 min) in user meta; sends it via `wp_mail()`. Returns `{success: true}` or 500 if mail fails.
- `umgpc_verify_code(WP_REST_Request) -> response` — compares the stored code, enforces expiry, clears the code meta, then returns `{token, user: {id, email, name, payment_status, is_judge, is_admin}}` using `umgpc_generate_jwt()`. `is_judge` / `is_admin` are `user_can()` checks for the `umgpc_judge_submissions` / `umgpc_admin_results` capabilities defined in [roles.php](roles.php.md) — informational flags for the frontend only; every judging endpoint re-checks the capability server-side.
- `umgpc_me(WP_REST_Request) -> response` — resolves the bearer token via `umgpc_get_user_from_request()`; returns `{id, email, name, payment_status, is_judge, is_admin}` (payment status defaults to `unpaid`; the two booleans as above).

## Dependencies
- Internal: [jwt.php](jwt.php.md), [config.php](config.php.md) (`UMGPC_CODE_EXPIRY`), [roles.php](roles.php.md) (the capabilities behind `is_judge`/`is_admin`; roles.php is loaded first so they exist by the time these run).
- External: `wp_mail()` (email delivery), WordPress users API (`wp_insert_user`, `get_user_by`), user meta.

## Used by
The UMG frontend login flow: `requestCode` / `verifyCode` / `getMe` in [apps/umg/lib/auth/api.ts](../../../apps/umg/lib/auth/api.ts.md), driven by [apps/umg/lib/auth/AuthContext.tsx](../../../apps/umg/lib/auth/AuthContext.tsx.md). The judge panel's `apps/umg/app/admin/AdminGuard.tsx` reads `user.is_judge` from the same `/me` payload to decide whether to render `/admin`.

## Notes
- User meta written: `umgpc_auth_code`, `umgpc_auth_code_expiry`, `umgpc_payment_status`.
- Code comparison uses `!==` (not timing-safe) but codes are single-use, short-lived, and cleared after success or expiry.
- No rate limiting on `request-code` — each call re-sends mail and may create users; consider abuse implications.
- Account creation is implicit: requesting a code for an unknown email registers it — always as a `subscriber`. Judges and admins log in through this exact same code flow; what makes them a judge is a role assigned in wp-admin ([roles.php](roles.php.md)), never anything this file does.

---
*Documented at commit bde729d.*
