# Unbiased Review: Alipay Payment Failures via Stripe (July 2026)

> Independent diagnosis from raw observations only — written without consulting any other
> docs in this repo, to avoid anchoring on prior conclusions.

## Situation

- US Stripe account (LLC, USD) sells a $50 competition entry fee via a Stripe-hosted
  Payment Link (`buy.stripe.com`). Customers are students in mainland China.
- Methods at checkout: Alipay, cards (incl. UnionPay), Apple Pay.
- The site only opens the payment link with a prefilled email; a WordPress backend
  consumes Stripe webhooks to mark users paid.

## Key observations

- **May 23, 2026**: one Alipay payment succeeded (charge has an Alipay `transaction_id`,
  `buyer_id`, and a `balance_transaction`).
- **Since ~Jun 30, 2026**: every Alipay attempt fails. Multiple distinct real customers
  (qq.com emails, CN billing); one retried 5 times.
- Failed PaymentIntents: `requires_payment_method`; `last_payment_error` =
  `payment_method_provider_decline` / decline_code `partner_payment_not_found` /
  "The payment provider can't find this payment." / `network_decline_code: SUCCESS`.
- Failed charges have `transaction_id: null`, `fingerprint: null`,
  `balance_transaction: null` — Alipay never created a transaction.
- Failing PIs are configuration-identical to the May 23 success (usd,
  automatic_async capture, `payment_method_options.alipay {}`).
- Desktop UX: reaches an **Alipay+** "Scan QR to pay" hosted page (correct
  merchant/amount, ~5-min expiry), then the payment fails/cancels ~5 min after creation.
- Mobile UX: Stripe checkout hangs on "Processing…" and never redirects to Alipay.
- Cards on the same Payment Link succeed (May 2, Mar 17).
- Account healthy: `charges_enabled`, `payouts_enabled`, no `disabled_reason`, empty
  requirements. Payment-method config shows alipay `available: true`, preference on.
- `alipay_payments` is absent from the account's 18 capabilities, and fetching
  `/v1/accounts/{id}/capabilities/alipay_payments` returns "Unknown capability".
- Timeline quirk: Jun 30 attempts ended `status=canceled` with no decline reason;
  Jul 1–2 attempts ended `status=failed` with the decline above.

## Headline conclusion

**The failure lives in the Stripe ↔ Alipay partner layer, not in anything the merchant
controls.** Stripe accepts the attempt and renders the Alipay+ QR page, but the order
was never successfully registered (or was rejected) on Alipay's side — so when the
customer's app or Stripe's status poll looks it up, Alipay answers "no such payment,"
and the intent dies at the ~5-minute QR expiry.

Evidence: null `transaction_id`/`fingerprint`/`balance_transaction` on failures, the
decline is literally `partner_payment_not_found`, and the mobile flow hangs because
Stripe never gets a usable redirect from Alipay at all.

### Red herring: the missing `alipay_payments` capability

Per Stripe's docs, **standard (non-Connect) accounts enable Alipay via Dashboard
payment-method settings**; the `alipay_payments` capability only exists for connected
accounts (private preview). "Unknown capability" on a standard US account is **expected**
and consistent with the dashboard showing alipay `available: true`. The account-level
config is genuinely clean — which further pins the break on the partner side.

## Root causes, ranked

### 1. Alipay sub-merchant registration invalidated on Ant's side (most likely)

When Stripe onboards a merchant for Alipay, a secondary-merchant record is registered
with Ant/Alipay under Stripe's partnership. If that record is deactivated (expired,
revoked, or dropped), Stripe still *thinks* Alipay is enabled, still creates payment
attempts, but Alipay rejects or refuses to persist the order → "payment not found" when
the wallet scans. Explains every observation: green account status, correct QR page
(hosted front-end renders before Alipay has to honor the order), null transaction IDs,
uniform failure across distinct customers, cards unaffected. The abrupt start at a
month/quarter boundary (Jun 30) smells like a scheduled recertification, registration
expiry, or compliance-batch job.

### 2. The likely *reason* behind #1: business-category risk flag

Alipay maintains its own prohibited/restricted list (separate from Stripe's), and
cross-border Alipay is strict about anything contest/prize/lottery-adjacent. A "$50
competition entry fee" paid by mainland Chinese individuals to a US LLC is exactly the
shape Ant's risk models flag as sweepstakes/gambling-adjacent capital outflow. A
compliance sweep de-registering the merchant would produce this exact pattern.
(Sub-cause of #1, but it changes the remediation.)

### 3. Stripe-side regression or Alipay+ cutover bug (plausible)

Customers see an **Alipay+** hosted page — the newer cross-border scheme — and the
failure *changed shape* mid-stream: Jun 30 attempts `canceled` with no reason, Jul 1+
`failed` with a surfaced decline. That's the signature of a deployment/cutover around
that date. Also `network_decline_code: SUCCESS` paired with a decline is internally
incoherent — Alipay's API returned a success transport code while the business result
was "not found," suggesting Stripe's error mapping in this flow is at least partly
broken. If the May 23 success went through the *legacy* Alipay flow and the account was
migrated to Alipay+ in June without the mainland-China wallet properly enabled in the
new registration, you'd see exactly this: QR page renders, but mainland Alipay app
users can't find the order. Would likely affect a cohort of merchants, not just one.

### 4. China-side regulatory block on customers (unlikely)

Cross-border quotas or real-name issues fail per-customer with wallet-side errors, not
uniformly across multiple distinct customers with a merchant-side "payment not found."

### 5. Something the merchant changed (very unlikely)

Failing PIs are configuration-identical to the May success, the Payment Link works for
cards, and the site only opens the link with a prefilled email — no code path on the
merchant side can produce a partner-side "payment not found." The webhook consumer is
downstream and irrelevant to the failure.

## Distinguishing evidence, and who can obtain it

### Merchant can get today

- **Dashboard + email sweep** — Settings → Payment methods for any warning state on
  Alipay; search inbox for anything from Stripe about Alipay/Alipay+ in May–June.
  Deactivations usually come with a notice; category revocations almost always do.
- **May 23 charge's flow** — did its receipt/hosted page say "Alipay" vs "Alipay+"?
  Legacy-then-migrated supports cause #3.
- **Customer screenshot of the Alipay app after scanning.** The exact Chinese error is
  highly diagnostic: "订单不存在" (order doesn't exist) → order never registered (#1/#3);
  a risk-control or "merchant not supported" message → compliance flag (#2).
- **Test from a non-mainland Alipay+ wallet** (AlipayHK, GCash, Touch 'n Go). If those
  succeed while mainland Alipay fails → CN-wallet enablement in an Alipay+ registration
  (#3, or CN-specific compliance under #2).
- **Fresh Payment Link / Checkout Session test** — will almost certainly fail the same
  way, but a success would mean a stale link-level payment-method snapshot (done).

### Only Stripe can get

- Raw provider request/response for order creation on a failed PI: did Ant accept the
  order and return an order ID, or reject it? Rejected → registration/compliance
  (#1/#2). Accepted-but-not-findable → routing/migration bug (#3).
- The Alipay secondary-merchant registration status with Ant, and whether the account
  was in a migration cohort around Jun 30.
- Whether other merchants show the same failure signature since Jun 30 (systemic vs
  account-specific).

### Only Alipay/Ant can get (via Stripe — merchants can't contact Ant directly)

- Internal status and risk flags on the sub-merchant record; the category
  classification applied.

## Could the merchant have caused or fix it?

**Caused it:** almost certainly not. The only self-inflicted path is indirect — a change
to business profile, statement descriptor, or public website triggering Ant's risk
re-review of the category. Nothing in the Stripe config changed, and the failure
mechanics aren't reachable from the merchant side.

**Fix it:** not the root cause — no API or dashboard knob re-registers a merchant with
Ant. The merchant can mitigate (below) and run the fresh-link falsification test.

## Recommended next steps

1. **Now** — dashboard/email sweep (5 min). A deactivation notice = answer found.
2. **Now** — Stripe support ticket with 2–3 failed PI IDs + the May 23 success charge
   ID, and two pointed questions:
   - *"What did Alipay return when the order was created on these failed
     PaymentIntents?"*
   - *"Is our Alipay merchant registration with Ant currently active, and was our
     account migrated to Alipay+ between May 23 and June 30?"*
3. **In parallel** — get one affected student to screenshot what their Alipay app shows
   after scanning the QR.
4. **Mitigate immediately** — cards work on the same link, and mainland students
   essentially all have UnionPay cards: update how-to-enter guidance to steer CN
   customers to UnionPay/card while Alipay is down. WeChat Pay is a possible second
   wallet, though a category-based compliance flag (#2) would likely hit it too.
5. **If Stripe confirms a category/compliance revocation** — the conversation shifts
   from technical to classification: how the product is described (competition entry
   with prizes vs. a program/exhibition fee) materially affects Ant's categorization.
   Business decision, to be taken deliberately.

## Sources

- [Stripe Alipay docs](https://docs.stripe.com/payments/alipay)
- [Activating Alipay on your Stripe account](https://support.stripe.com/questions/activating-alipay-on-your-stripe-account)
- [Business and International versions of Alipay](https://support.stripe.com/questions/business-and-international-versions-of-alipay)
- [Stripe error codes](https://docs.stripe.com/error-codes)
- [Alipay prohibited business list (Stripe legal)](https://stripe.com/legal/alipay)
- [Stripe restricted businesses](https://stripe.com/restricted-businesses)

---
*Written 2026-07-02 as an independent second opinion; intentionally not reconciled with
other docs in this folder.*
