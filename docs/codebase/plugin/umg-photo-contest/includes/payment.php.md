# docs/plugin/umg-photo-contest/includes/payment.php

**Purpose:** Payment-status REST endpoint and Stripe webhook receiver that marks users as paid.

## Responsibilities
Lets the frontend poll whether the logged-in user has paid the entry fee, and processes Stripe checkout settlement webhooks (from the Stripe Payment Link configured in the frontend competition config) by matching the payer to a WP user and marking them paid.

## REST routes (namespace `umg/v1`)
| Method | Path | Auth | Callback |
|--------|------|------|----------|
| GET | `/payment-status` | Bearer JWT | `umgpc_payment_status` |
| POST | `/stripe-webhook` | Stripe signature (`Stripe-Signature` header) | `umgpc_stripe_webhook` |

## Key exports
- `umgpc_payment_status(WP_REST_Request) -> response` — returns `{payment_status: 'paid'|'unpaid', payment_date: string|null}` from user meta.
- `umgpc_stripe_webhook(WP_REST_Request) -> response` — manually parses the `Stripe-Signature` header (`t`/`v1` parts), verifies HMAC-SHA256 of `"{timestamp}.{payload}"` against `UMGPC_STRIPE_WEBHOOK_SECRET` with `hash_equals`, rejects events older than 5 minutes (replay protection). Acts only on **settled** payments: `checkout.session.completed` with `payment_status === 'paid'` (immediate methods — cards, wallets) or `checkout.session.async_payment_succeeded` (asynchronous methods like Alipay, which complete first as "processing" and settle later). `async_payment_failed` and completed-but-still-processing sessions are acknowledged and skipped. Then gates on **purpose**: a session `metadata.purpose` other than `entry_fee` is skipped (sessions with no purpose metadata are treated as entry fees, since the current link predates the metadata — any future Payment Link, e.g. donations, must set its own purpose). Matches the WP user by `client_reference_id` (the WP user id, set by the frontend on the payment-link URL) first, falling back to `customer_email` (or `customer_details.email`) for sessions created before that param existed. On no match, `error_log`s the event id/type/email/amount/session/client_ref and still acknowledges with `{received: true}` so Stripe stops retrying — the miss is reconciliation data, not a signal to retry. On match, sets user meta `umgpc_payment_status = 'paid'`, `umgpc_stripe_payment_id` (session ID), `umgpc_payment_date`.

## Dependencies
- Internal: [jwt.php](jwt.php.md) (auth guard), [config.php](config.php.md) (`UMGPC_STRIPE_WEBHOOK_SECRET`).
- External: Stripe webhooks (signature verification implemented by hand — no Stripe SDK), WordPress user meta.

## Used by
- Frontend `getPaymentStatus` in [apps/umg/lib/auth/api.ts](../../../apps/umg/lib/auth/api.ts.md) (payment gate before submission).
- Stripe's webhook delivery system calls `/wp-json/umg/v1/stripe-webhook` (endpoint subscribed to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed` in the Stripe dashboard). The Payment Link carries `client_reference_id=<wp_user_id>` from [SubmissionForm.tsx](../../../apps/umg/app/photo-submission/components/SubmissionForm.tsx.md) and `metadata.purpose=entry_fee` (set on the link itself in the Stripe dashboard).

## Notes
- Payment is tracked **per user**, not per submission — one payment covers the user's single entry. Multiple entries per user would require moving payment meta onto `umg_submission` posts.
- If a customer pays before ever requesting a login code, no WP user exists yet and the webhook is a no-op — the payment is not retroactively applied when the user later signs up.
- Without `UMGPC_STRIPE_WEBHOOK_SECRET` set, every webhook returns 400.
- A tampered `client_reference_id` could in principle credit the wrong user; this matches the pre-existing trust model (the payment link is unauthenticated and email was equally forgeable) and is accepted for now — server-side association is planned for the custom-backend migration.
- Async settlement + `client_reference_id`/purpose matching were both added in response to a live outage investigation (Alipay payments failing at the Stripe↔Alipay partner layer, unrelated to this file) — see `docs/future-work/alipay-incident-log.md` and `docs/future-work/payment-pipeline-audit.md` in the repo root (not mirrored here; planning docs, not source).

---
*Documented at commit f4c4cca.*
