# Conversion Scaffold — `umg-newsletter`

> Thin Mailchimp proxy on the UMG install: one route,
> `POST umg/v1/subscribe`, which rate-limits by hashed IP (transients),
> validates the email, and calls the Mailchimp members API
> (`subscribe.php`). Conversion ≈ **half a day**, independent of every other
> phase — can go first as a low-stakes pilot of the edge-function pattern.

## Conversion map

| Plugin file | Fate | Target |
| --- | --- | --- |
| `subscribe.php` | Convert | **edge function `subscribe`**: same flow — rate limit, validate, call Mailchimp, apply tags (`umg_newsletter_apply_tags`). Mailchimp key/list/server-prefix move from PHP constants to function secrets |
| `cors.php` | **DELETE** | platform |
| `config.php` (origins, rate limit const) | Convert | function config/env |

## Decisions to make at conversion time

1. **Keep Mailchimp or move the list?** The plugin is only a proxy — the
   subscriber list lives in Mailchimp. Cheapest: keep Mailchimp, port the
   proxy verbatim. Alternative (only if consolidating vendors): a
   `newsletter_subscribers` table + Resend audiences — but that's a list
   migration + double-opt-in re-consent question, not a code question. Default:
   **keep Mailchimp**.
2. **Rate limiting**: WP transients → the shared `rate_limit_events` table
   (same limiter primitive as the contest, see remediation doc) or the edge
   platform's built-in limits. Keep the hashed-IP key.

## Frontend seam

One caller — the footer/newsletter form posts `email_address` to
`umg/v1/subscribe`. Swap the URL; request/response shape can stay identical
(same error codes: `invalid_email` 400, `rate_limited` 429).

## Cutover checklist

- [ ] Mailchimp secrets moved to function config (client-owned account, per architecture doc §9)
- [ ] Error-shape parity so the form's UX messages don't change
- [ ] Test: valid subscribe, duplicate subscribe (Mailchimp "already a member" path), rate-limit trip
- [ ] No data migration — the list never leaves Mailchimp

---
*Plan based on codebase at commit `adb65a1` (2026-07-04). If plugins, deploy
workflows, or providers have changed since, re-verify before executing.*
