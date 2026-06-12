# docs/plugin/umg-photo-contest/includes/jwt.php

**Purpose:** Dependency-free JWT (HS256) generation/validation helpers used by all authenticated routes.

## Responsibilities
Implements a minimal JWT in pure PHP: base64url encoding, HMAC-SHA256 signing with `UMGPC_JWT_SECRET`, signature verification with `hash_equals`, expiry checking, and bearer-token extraction from REST requests.

## Key exports
- `umgpc_base64url_encode($data) -> string` / `umgpc_base64url_decode($data) -> string`
- `umgpc_generate_jwt($user_id, $email) -> string` — signs `{user_id, email, exp: now + UMGPC_JWT_EXPIRY}`.
- `umgpc_validate_jwt($token) -> array|WP_Error` — verifies structure, signature (timing-safe), and expiry; returns decoded payload or 401 `WP_Error`.
- `umgpc_get_user_from_request($request) -> int|WP_Error` — reads the `Authorization: Bearer` header, validates the token, confirms the WP user still exists; returns the user ID. This is the de-facto auth guard for every protected endpoint.

## Dependencies
- Internal: [config.php](config.php.md) (`UMGPC_JWT_SECRET`, `UMGPC_JWT_EXPIRY`).
- External: PHP `hash_hmac`/`hash_equals`, WordPress `get_user_by`, `WP_Error`.

## Used by
- [auth.php](auth.php.md) — generates tokens on verify-code, validates on `/me`.
- [payment.php](payment.php.md), [draft.php](draft.php.md), [submission.php](submission.php.md) — every callback starts with `umgpc_get_user_from_request()`.
- Tokens originate from and are stored by the UMG frontend ([apps/umg/lib/auth/api.ts](../../../apps/umg/lib/auth/api.ts.md), [apps/umg/lib/auth/AuthContext.tsx](../../../apps/umg/lib/auth/AuthContext.tsx.md)).

## Notes
- Tokens are stateless — there is no revocation list; logout is purely client-side.
- All routes use `permission_callback => __return_true` and enforce auth inside the callback via this file, so WordPress's own auth/nonce layer is bypassed intentionally.

---
*Documented at commit 1cbdce5.*
