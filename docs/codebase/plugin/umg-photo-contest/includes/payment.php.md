# docs/plugin/umg-photo-contest/includes/payment.php

**Purpose:** Payment-status REST endpoint and Stripe webhook receiver that marks users as paid.

## Responsibilities
Lets the frontend poll whether the logged-in user has paid the entry fee, and processes Stripe `checkout.session.completed` webhooks (from the Stripe Payment Link configured in the frontend competition config) by matching the customer email to a WP user.

## REST routes (namespace `umg/v1`)
| Method | Path | Auth | Callback |
|--------|------|------|----------|
| GET | `/payment-status` | Bearer JWT | `umgpc_payment_status` |
| POST | `/stripe-webhook` | Stripe signature (`Stripe-Signature` header) | `umgpc_stripe_webhook` |

## Key exports
- `umgpc_payment_status(WP_REST_Request) -> response` — returns `{payment_status: 'paid'|'unpaid', payment_date: string|null}` from user meta.
- `umgpc_stripe_webhook(WP_REST_Request) -> response` — manually parses the `Stripe-Signature` header (`t`/`v1` parts), verifies HMAC-SHA256 of `"{timestamp}.{payload}"` against `UMGPC_STRIPE_WEBHOOK_SECRET` with `hash_equals`, rejects events older than 5 minutes (replay protection), handles only `checkout.session.completed`. Looks up the WP user by `customer_email` (falling back to `customer_details.email`); if found, sets user meta `umgpc_payment_status = 'paid'`, `umgpc_stripe_payment_id` (session ID), `umgpc_payment_date`. Unknown emails are acknowledged with `{received: true}` so Stripe does not retry.

## Dependencies
- Internal: [jwt.php](jwt.php.md) (auth guard), [config.php](config.php.md) (`UMGPC_STRIPE_WEBHOOK_SECRET`).
- External: Stripe webhooks (signature verification implemented by hand — no Stripe SDK), WordPress user meta.

## Used by
- Frontend `getPaymentStatus` in [apps/umg/lib/auth/api.ts](../../../apps/umg/lib/auth/api.ts.md) (payment gate before submission).
- Stripe's webhook delivery system calls `/wp-json/umg/v1/stripe-webhook` (configure the endpoint + secret in the Stripe dashboard).

## Notes
- Payment is tracked **per user**, not per submission — one payment covers the user's single entry. Multiple entries per user would require moving payment meta onto `umg_submission` posts.
- If a customer pays before ever requesting a login code, no WP user exists yet and the webhook is a no-op — the payment is not retroactively applied when the user later signs up.
- Without `UMGPC_STRIPE_WEBHOOK_SECRET` set, every webhook returns 400.

---
*Documented at commit 1cbdce5.*
