# docs/plugin/umg-photo-contest/includes/config.php

**Purpose:** Central constants and CORS origin list for the photo contest plugin.

## Responsibilities
Defines JWT, auth-code, and Stripe configuration constants (with safe fallbacks so the plugin loads even when `wp-config.php` overrides are absent) and the whitelist of allowed CORS origins.

## Key exports
- `UMGPC_JWT_SECRET` (constant) — JWT signing secret; falls back to WordPress `AUTH_KEY` if not defined in `wp-config.php`.
- `UMGPC_JWT_EXPIRY` = 604800 — JWT lifetime (7 days).
- `UMGPC_CODE_EXPIRY` = 900 — email verification code lifetime (15 minutes).
- `UMGPC_STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret; defaults to empty string (webhook then rejects all events).
- `umgpc_allowed_origins() -> string[]` — `http://localhost:3000`, `https://www.unitedmediadc.com`, `https://unitedmediadc.com`.

## Dependencies
- Internal: none (loaded first by [../umg-photo-contest.php](../umg-photo-contest.php.md)).
- External: WordPress `AUTH_KEY` constant.

## Used by
- [jwt.php](jwt.php.md) (`UMGPC_JWT_SECRET`, `UMGPC_JWT_EXPIRY`)
- [auth.php](auth.php.md) (`UMGPC_CODE_EXPIRY`)
- [payment.php](payment.php.md) (`UMGPC_STRIPE_WEBHOOK_SECRET`)
- [cors.php](cors.php.md) (`umgpc_allowed_origins()`)
- [../../umg-newsletter/includes/cors.php](../../umg-newsletter/includes/cors.php.md) checks for `umgpc_allowed_origins` existence to avoid duplicate CORS headers.

## Notes
- Production must define `UMGPC_STRIPE_WEBHOOK_SECRET` in `wp-config.php`; without it the Stripe webhook endpoint returns 400 for every request.
- Changing `UMGPC_JWT_SECRET` (or rotating `AUTH_KEY`) invalidates all outstanding tokens.

---
*Documented at commit 1cbdce5.*
