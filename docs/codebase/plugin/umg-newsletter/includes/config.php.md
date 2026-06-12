# docs/plugin/umg-newsletter/includes/config.php

**Purpose:** Mailchimp credentials, rate-limit constant, and CORS origin list for the newsletter plugin.

## Responsibilities
Defines the three Mailchimp constants (with empty-string fallbacks so the plugin loads without them — the endpoint then returns 500 `not_configured`), the per-IP rate limit, and the allowed CORS origins.

## Key exports
- `MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID`, `MAILCHIMP_SERVER_PREFIX` (constants) — must be defined in `wp-config.php` for production; default to `''`.
- `UMG_NL_RATE_LIMIT` = 5 — max subscribe requests per IP per hour.
- `umg_nl_allowed_origins() -> string[]` — `http://localhost:3000`, `https://www.unitedmediadc.com`, `https://unitedmediadc.com` (same list as the photo contest plugin).

## Dependencies
- Internal: none (loaded first by [../umg-newsletter.php](../umg-newsletter.php.md)).
- External: Mailchimp account values (API key, audience ID, datacenter prefix such as `us21`).

## Used by
- [subscribe.php](subscribe.php.md) (all constants)
- [cors.php](cors.php.md) (`umg_nl_allowed_origins()`)

## Notes
- The Mailchimp server prefix must match the datacenter suffix of the API key (e.g. key ending `-us21` → prefix `us21`).

---
*Documented at commit 1cbdce5.*
