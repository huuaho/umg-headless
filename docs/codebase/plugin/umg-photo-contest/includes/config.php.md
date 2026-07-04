# docs/plugin/umg-photo-contest/includes/config.php

**Purpose:** Central constants and CORS origin list for the photo contest plugin.

## Responsibilities
Defines JWT, auth-code, and Stripe configuration constants (with safe fallbacks so the plugin loads even when `wp-config.php` overrides are absent) and the whitelist of allowed CORS origins.

## Key exports
- `UMGPC_JWT_SECRET` (constant) — JWT signing secret; falls back to WordPress `AUTH_KEY` if not defined in `wp-config.php`.
- `UMGPC_JWT_EXPIRY` = 604800 — JWT lifetime (7 days).
- `UMGPC_CODE_EXPIRY` = 900 — email verification code lifetime (15 minutes).
- `UMGPC_STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret; defaults to empty string (webhook then rejects all events).
- `UMGPC_STRIPE_SECRET_KEY` — Stripe API **secret** key (restricted, Checkout Sessions: write only), used solely by [school.php](school.php.md)'s `POST /school/checkout` to create Checkout Sessions server-side; defaults to empty string. Distinct from `UMGPC_STRIPE_WEBHOOK_SECRET` above, which only verifies inbound webhooks and can't make outbound API calls.
- `umgpc_allowed_origins() -> string[]` — `http://localhost:3000`, `https://www.unitedmediadc.com`, `https://unitedmediadc.com`.

## Dependencies
- Internal: none (loaded first by [../umg-photo-contest.php](../umg-photo-contest.php.md)).
- External: WordPress `AUTH_KEY` constant.

## Used by
- [jwt.php](jwt.php.md) (`UMGPC_JWT_SECRET`, `UMGPC_JWT_EXPIRY`)
- [auth.php](auth.php.md) (`UMGPC_CODE_EXPIRY`)
- [payment.php](payment.php.md) (`UMGPC_STRIPE_WEBHOOK_SECRET`)
- [school.php](school.php.md) (`UMGPC_STRIPE_SECRET_KEY`, `umgpc_allowed_origins()` for validating Checkout Session redirect URLs)
- [cors.php](cors.php.md) (`umgpc_allowed_origins()`)
- [../../umg-newsletter/includes/cors.php](../../umg-newsletter/includes/cors.php.md) checks for `umgpc_allowed_origins` existence to avoid duplicate CORS headers.

## Notes
- Production must define `UMGPC_STRIPE_WEBHOOK_SECRET` in `wp-config.php`; without it the Stripe webhook endpoint returns 400 for every request.
- Production must also define `UMGPC_STRIPE_SECRET_KEY` for the school checkout endpoint to work; without it, `POST /school/checkout` returns 500 `stripe_not_configured`. This key was obtained and saved directly to `wp-config.php` (never exposed to any AI session); scope it as a **restricted** key (Checkout Sessions: write only, everything else none) — see `claude-context/current-work/bulk-registration/stripe-secret-key-setup.md`.
- Changing `UMGPC_JWT_SECRET` (or rotating `AUTH_KEY`) invalidates all outstanding tokens.

---
*Documented at commit e5821d4.*
