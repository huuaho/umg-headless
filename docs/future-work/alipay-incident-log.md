# Alipay Payment Outage — Incident & Support Log

Running record of the Alipay payment failure investigation. Companion to the RCA
in [payment-pipeline-audit.md](payment-pipeline-audit.md#-investigation-alipay-stuck-on-processing-2026-07-01--root-cause-not-confirmed).

**Status:** 🔴 Open — **escalated to Stripe's specialized team (2026-07-02), chat
converted to email; awaiting their investigation.** Root cause not yet confirmed.

---

## Summary

- Alipay payments fail ~100% since **~June 30, 2026** with
  `decline_code: partner_payment_not_found` at `alipay_handle_redirect`.
- Alipay **worked on May 23, 2026** (`pi_3TaEmCBVqSmFnmcs2XvMzTgx`); failing PIs
  are configuration-identical.
- Affected users are **real applicants** (mainland-China Alipay wallets, qq.com,
  billing country CN). Only internal test accounts are `kenho_99` and `daisy`.
- Ruled out: our webhook/plugin code; a "lapsed capability" (Alipay is Alipay+,
  not a classic per-account capability — retracted theory).
- Mitigation in effect / recommended: route entrants to **UnionPay/card**
  (active and working).

Account: **United Media Group, LLC — `acct_1T2dn8BVqSmFnmcs`** (US, USD, Live).

---

## Timeline

### 2026-06-30 — first failures
Alipay attempts begin failing (`canceled`, then `failed`). Real applicants
`769212733@qq.com` and `xiaoshulin030@qq.com`; one retried 5×.

### 2026-07-01 — CLI investigation (self-serve)
Via Stripe CLI (live mode), read-only:
- Confirmed `partner_payment_not_found` / "provider can't find this payment" on all
  recent attempts; full billing details present (real CN customers).
- May 23 success is config-identical to the failures.
- Account healthy: `charges_enabled`, `payouts_enabled`, no `disabled_reason`,
  nothing `currently_due`.
- No `alipay_payments` capability exists on the account ("Unknown capability") —
  Alipay is provisioned via **Alipay+**; capability absence is not a signal.

Failing PI examples: `pi_3ToXo2BVqSmFnmcs1bpcBOwp`, `pi_3ToXijBVqSmFnmcs0WLg9v8f`
(Jul 1); `pi_3ToZFjBVqSmFnmcs2jUyPK9V`, `pi_3ToZZqBVqSmFnmcs1yxjBQof` (Jul 2).

### 2026-07-01 — Stripe Support contacted
Submitted a support request (subject: "Alipay payments failing 100% with
`partner_payment_not_found` since ~June 30 — worked in May") with the account ID,
error block, the May 23 success PI, four failing PIs, and five questions
(partner-side reason; eligibility/routing change since May; CN→US USD cross-border
restriction; Alipay+ QR/redirect handoff; how to restore).

### 2026-07-01 — Stripe Support (AI bot) first response
Bot confirmed the pattern and added **new evidence from the charge objects**:

- **May 23 success** (`pi_3TaEmCBVqSmFnmcs2XvMzTgx`): completed with a **valid
  Alipay `transaction_id` and `buyer_id`**.
- **All Jul 1–2 failures**: `transaction_id` and `fingerprint` are **`null`** in
  the charge details → **Alipay never completed the handoff.**
- `network_decline_code: SUCCESS` paradox + 100% failure + missing transaction IDs
  → **provider-side integration/routing issue, not individual customer problems.**

Bot's candidate causes (provider-side):
1. **Alipay+ cross-border routing/eligibility change** for US merchants accepting
   mainland-China wallets in USD, between May and June.
2. **Account-level Alipay config / merchant-agreement status** changed or expired.
3. **Provider API handoff failure** — the redirect URL / session token Stripe
   generates isn't recognized by Alipay's authorization system.

Bot's stated blind spots (why it can't close this out): no visibility into
Alipay's internal logs, merchant-agreement status, or provider-side eligibility/
routing changes. **Recommended escalation to Stripe's payments infrastructure
team** to investigate provider-side logs and coordinate with Alipay.

> Note: this was the **AI support bot**, not a human specialist. Its findings are
> preliminary but the `transaction_id`/`fingerprint = null` observation is a
> concrete, useful new data point pointing to a broken handoff before Alipay.

### 2026-07-01 — escalated to human specialist (live chat)
Accepted the escalation; connected via chat to a human Stripe support agent
(**Caleb**). Pasted the factual brief (account, symptom, timeline, error,
config-identical May success, four failing PIs, null `transaction_id`/`fingerprint`
evidence, customer-side behavior, ruled-out items, and the four provider-side
questions). Agent reviewing. **Awaiting response.**

### 2026-07-01 — agent (Caleb) findings
Reviewed `pi_3ToZZqBVqSmFnmcs1yxjBQof` and the others. Confirmed on the failed
charges: `balance_transaction`, `transaction_id`, and `fingerprint` are **all
null** (vs. May 23 success which has `balance_transaction: txn_3TaEmC…` and a
valid Alipay transaction id/buyer id). Agent explicitly **ruled out, from
Stripe's side: disabled account, capability issue, Payment Link misconfiguration.**
Conclusion: payments fail **during the Alipay handoff, before Alipay associates
the session with a valid transaction.** No root cause identified at the charge
level — at the limit of first-line tooling; **escalation to payments/Alipay team
requested.**

> Note: the three null fields are one fact (payment never completed), viewed from
> three angles — not independent clues. Still a *symptom*, not a cause.

### 2026-07-01 — asked agent to confirm ownership + resolution path
Sent: confirmation that the failing handoff is **Stripe → Alipay** (we use the
**hosted** Stripe Payment Link; our site never contacts Alipay), and asked whether
the issue is on Stripe's end with nothing on our side, plus how to resolve. Agent:
"Let me double check this for you." **Awaiting response.**

### 2026-07-02 — escalated to specialized team (chat → email)
Agent (Caleb) forwarding the case to Stripe's specialized team for further
investigation; converting the chat into an email thread to complete the transfer.
No root cause or written Stripe-side confirmation given in-chat yet. **Action:
capture the case/ticket number and confirm the email carries all facts + questions.**

---

### 2026-07-02 — email reply from agent "Harrel" (deflection)
The escalation email was answered by another agent (**Harrel**) with a generic
decline response, **not** a payments-engineering analysis:
- Claims the account is fine and customers "should be able to pay… without issues."
- Treats the failures as a generic provider decline; **links to the
  `generic_decline` docs — the WRONG code** (ours is `partner_payment_not_found`).
- Says Stripe has no detailed decline info; advises **asking the customer to
  contact Alipay** and to confirm their Alipay supports international payments.
- Claims "no reported incidents" of Alipay declines.

**Assessment — this response is inconsistent with the evidence:**
- It conflates "Alipay declined a charge" with our actual signature — **null
  `transaction_id`/`fingerprint`/`balance_transaction`**, which Caleb himself
  confirmed means **Alipay never registered the session** (handoff failed *before*
  Alipay saw the payment). A real decline would carry a `transaction_id`.
- The "individual customer account" explanation does **not** fit **~100% failure
  since ~Jun 30 across multiple distinct customers** with **identical config to a
  May 23 success**. Independent customers don't all lose international Alipay on
  the same date.
- Wrong doc/code cited (generic_decline vs partner_payment_not_found) shows the
  specific error wasn't engaged with.

**Next:** reply pushing back with the null-`transaction_id` distinction + the
temporal/volume pattern + wrong-code note; demand a genuine escalation to the
payments/Alipay engineering team; run the customer-side Alipay confirmation **in
parallel** to close that escape hatch. Still need a **case/ticket number**.

**Doc check (https://docs.stripe.com/declines/codes) — corrected:**
- Harrel's doc link (a `#:~:text=` fragment) actually highlights the row for
  **`partner_generic_decline`** ("The payment provider has declined the payment"),
  a **provider-side** Local Payment Method decline. (An earlier note here wrongly
  said he linked `generic_decline`, the card-issuer code — retracted.)
- **Our actual code is `partner_payment_not_found`** ("The payment provider can't
  find this payment") — a *different, more specific* LPM code. `partner_generic_
  decline` = provider *declined*; `partner_payment_not_found` = provider *can't
  find* the payment (never registered) — which matches our null `transaction_id`.
- Both are provider-side. Nothing in the docs assigns our code a customer-action
  remedy or points at our integration.

---

### 2026-07-02 — pushback accepted; genuine escalation confirmed
Sent the corrected rebuttal (code meaning + null `transaction_id` + fleet-wide
pattern + hosted-link ownership). Two replies followed:

1. **Harrel (5:13 PM):** *"I see your point now. Kindly allow me to work on this
   further together with my colleagues."* — deflection withdrawn.
2. **"Nice" (6:23 PM), specialized team update:**
   - Escalated for **immediate investigation**, treated as **highest priority**.
   - Stripe's own framing now matches ours: *"affecting **100% of your Alipay
     transactions despite no changes to your configuration**"* — i.e. Stripe
     accepts it is not customer-side or integration-side.
   - Team is conducting **root-cause analysis of the `partner_payment_not_found`
     errors** and will "implement a resolution as quickly as possible," with
     regular updates via the email thread.

**Still missing:** a case/ticket number and an ETA. **Mitigation stands:** route
applicants to UnionPay/card until Stripe confirms resolution; verify with a live
Alipay payment before telling clients it's fixed.

---

## Current best understanding

The handoff to Alipay is failing **before** Alipay registers the payment (null
`transaction_id`/`fingerprint`), consistently, for real CN customers, since ~Jun
30, with identical config to a May success. This points to a **provider-side
Alipay+/cross-border or account-integration issue** — but the exact mechanism is
**still unconfirmed** and requires Stripe's infra team + Alipay.

## Next actions

- [ ] **Reply "yes"** to the bot's offer to connect with a specialist / payments
      infrastructure team (this is the path to the actual answer).
- [ ] Ask the specialist specifically: did Alipay+ cross-border routing/eligibility
      for CN→US USD change ~late June? Is our Alipay merchant agreement still valid?
      Where exactly does the redirect/session handoff fail?
- [ ] **Mitigation:** ensure applicants can use **UnionPay/card**; consider hiding
      Alipay at checkout until resolved.
- [ ] Log the specialist's response here when it arrives.

## Open questions

- What does Alipay report on their side for these sessions?
- Did anything change on the account's Alipay/Alipay+ status between May 23 and Jun 30?
- Is there a CN→US USD cross-border restriction now in effect?
