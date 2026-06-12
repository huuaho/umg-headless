# docs/plugin/umg-newsletter/includes/subscribe.php

**Purpose:** REST endpoint that proxies newsletter signups to the Mailchimp Marketing API (server-side, key never exposed).

## Responsibilities
Validates and rate-limits subscribe requests, adds the member to the Mailchimp audience with double opt-in (`status: pending`), maps Mailchimp error states to friendly responses, and tags new members.

## REST routes (namespace `umg/v1`)
| Method | Path | Auth | Callback |
|--------|------|------|----------|
| POST | `/subscribe` | Public (rate-limited) | `umg_newsletter_subscribe` |

## Key exports
- `umg_newsletter_subscribe(WP_REST_Request) -> response` — flow:
  1. 500 `not_configured` if any Mailchimp constant is empty.
  2. Rate limit: transient keyed by SHA-256 hash of `REMOTE_ADDR`, max `UMG_NL_RATE_LIMIT` (5)/hour → 429 `rate_limited`. The counter increments before validation.
  3. `is_email()` check → 400 `invalid_email`.
  4. `wp_remote_post` to `https://{prefix}.api.mailchimp.com/3.0/lists/{list}/members` with Basic auth and `{email_address, status: 'pending'}` (double opt-in).
  5. Responses: 200 → success + tag call; Mailchimp 400 "Member Exists" → friendly success ("You're already subscribed!"); 400 "Forgotten Email Not Subscribed" → 400 `compliance_block`; anything else → 502 `mailchimp_error` (logged).
- `umg_newsletter_apply_tags($email) -> void` — second Mailchimp call to `/members/{md5(email)}/tags` applying `website-signup` and `umg-main`; failures only logged.

## Dependencies
- Internal: [config.php](config.php.md) (Mailchimp constants, `UMG_NL_RATE_LIMIT`).
- External: Mailchimp Marketing API v3 (`wp_remote_post`), WordPress transients, `error_log` (prefix `UMG Newsletter:`).

## Used by
[packages/ui/NewsletterSignup.tsx](../../../packages/ui/NewsletterSignup.tsx.md) (`fetch(\`${apiBaseUrl}/umg/v1/subscribe\`)`), rendered in the shared Footer when a site passes `apiBaseUrl` (currently the UMG app).

## Notes
- Double opt-in: subscribers stay `pending` until they click Mailchimp's confirmation email.
- Rate-limit transients (`umg_nl_rate_<hash>`) live in `wp_options`/object cache for one hour.
- Tagging happens only on brand-new members (HTTP 200 path), not on "Member Exists".

---
*Documented at commit 1cbdce5.*
