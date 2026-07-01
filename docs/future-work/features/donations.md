# Donations — UMG (unitedmediadc.com)

> Intent: let visitors donate to United Media Group via a dedicated `/donate` page, reusing the existing Stripe setup, without entangling donations with the contest entry-fee payment flow.

---

## Overview

The UMG site already collects contest **entry fees** through a Stripe **Payment Link**
(`apps/umg/lib/competitions/current.ts` → `stripePaymentLink`), consumed on the
submission flow (`apps/umg/app/photo-submission/components/SubmissionForm.tsx`,
`const stripeUrl = \`${competition.stripePaymentLink}?prefilled_email=...\``), and
settled server-side by a signature-verified webhook
(`docs/plugin/umg-photo-contest/includes/payment.php` → `POST /umg/v1/stripe-webhook`).

A general **Donations** feature is a small add-on: create a **second, independent**
Stripe Payment Link (or Checkout), add a static `/donate` page that links to it, and
wire a nav/footer entry. The UMG frontend is a **static export** (`apps/umg/next.config.ts`
→ `output: "export"`), so there is no Next.js server to run donation logic — Stripe's
hosted page does all the work. No new backend code is required for the recommended path.

---

## Key decisions

| Decision | Recommendation | Why |
|----------|----------------|-----|
| One-time vs. recurring | **One-time to start**, optionally enable recurring later | Payment Links support recurring with one toggle; start simple. |
| Fixed tiers vs. custom amount | **Custom amount** ("customer chooses price") + a few suggested presets | Stripe Payment Links support a "customer chooses what to pay" price; presets can be extra links or a Checkout with preset buttons. |
| Track server-side / receipt | **No custom tracking.** Rely on Stripe's built-in email receipts and the Stripe Dashboard | Donations don't need to gate any site feature (unlike entry fees, which flip `payment_status`). Stripe already records every transaction and can email receipts. |
| Anonymous vs. attributed | **Anonymous / no login required** | Donors are the public, not registered contest users. Do not require the JWT auth flow. Stripe collects name/email on its own page for the receipt. |
| Payment Link vs. Checkout vs. custom PaymentIntent | **Payment Link** (doc "Option A") | Zero code, zero backend, works with static export. Upgrade to Checkout ("Option B") only if preset-amount buttons or a branded flow are wanted; a custom PaymentIntent endpoint ("Option C") is not justified. |

### CRITICAL — do NOT reuse the entry-fee webhook path

The existing webhook `umgpc_stripe_webhook` (`payment.php`) listens for
`checkout.session.completed` / `checkout.session.async_payment_succeeded`, looks up a WP
user by `customer_email`, and sets `umgpc_payment_status = 'paid'`. That endpoint is
registered against the **Stripe account**, so it receives events for **every** completed
checkout on that account — **including donations**. If a donation is made from an email
that matches a registered contest user, that user would be **wrongly marked as a paid
contest entrant**.

Mitigation (choose one, do this as part of shipping donations):

1. **Preferred — scope the entry-fee webhook so it ignores donations.** Add `metadata`
   (e.g. `purpose: "entry_fee"`) to the entry-fee Payment Link, and in
   `umgpc_stripe_webhook` only mark the user paid when
   `$session['metadata']['purpose'] === 'entry_fee'` (or when the session's price/product
   matches the known entry-fee price ID). Donations, lacking that marker, are acknowledged
   and ignored. This is the robust fix and should be treated as a prerequisite.
2. Alternatively, run donations through a **separate Stripe account** (heavier, avoid).

Donations must **not** call, extend, or share code with the entry-fee `payment_status`
path. A donor is never a "paid" contest entrant.

---

## Recommended approach — numbered steps

Simplest thing that works: dedicated Stripe **Payment Link** + static `/donate` page +
nav/footer link.

### A. Stripe setup (dashboard, no code)

1. In the Stripe Dashboard, create a **Product** named e.g. "United Media Group Donation".
   Set its price to **"Customer chooses what to pay"** (custom amount), currency USD,
   optional minimum (e.g. $5). For recurring, additionally create a monthly recurring price.
2. Create a **Payment Link** for that product. Enable **email receipts** (Settings →
   Customer emails). Set the after-payment behavior to redirect to a thank-you URL
   (`https://unitedmediadc.com/donate/thank-you` — see step C4) or use Stripe's default
   confirmation.
3. **Add link metadata** `purpose: donation` so the entry-fee webhook can distinguish it
   (pairs with the entry-fee `purpose: entry_fee` marker in the CRITICAL section).
4. Copy the resulting `https://buy.stripe.com/...` URL for use in config below.

### B. Config

5. Add a donations config value rather than hardcoding the URL in JSX. Since donations are
   not competition-specific, put it in a small site config rather than
   `lib/competitions/current.ts`. Create
   `apps/umg/lib/site/donations.ts`:
   ```ts
   export const donations = {
     enabled: true,
     stripeDonationLink: "https://buy.stripe.com/XXXXXXXX", // from step A2
     presets: [10, 25, 50, 100], // optional suggested amounts (display only)
   };
   ```
   (If a `lib/site/` dir does not exist yet, create it — keeps donation config separate
   from `currentCompetition` so it is not mistaken for an entry-fee link.)

### C. Frontend page

6. Create the route `apps/umg/app/donate/page.tsx` — a static page (mirror the structure
   of `apps/umg/app/how-to-enter/page.tsx`: `export const metadata`, server component,
   Tailwind, `@umg/ui` where useful). Content:
   - Heading + short "why donate / where funds go" copy.
   - A primary **"Donate" button** that is a plain `<a href={donations.stripeDonationLink}>`
     (external link to Stripe's hosted page). Optionally render preset-amount buttons that
     link to the same link (or to per-amount links if preset Payment Links are created).
   - No form, no auth, no `useAuth`, no client-side payment polling. Unlike
     `SubmissionForm.tsx`, do **not** append `prefilled_email` from an auth user and do
     **not** poll `/umg/v1/payment-status`.
7. Add `export const metadata` (title/description) and, optionally, `DonateAction` schema
   or an `Organization`/`DonateAction` JSON-LD block consistent with the site's existing
   schema pattern in `how-to-enter/page.tsx` (optional, nice-to-have).
8. (Optional) Create `apps/umg/app/donate/thank-you/page.tsx` — a simple static
   confirmation page to use as the Stripe redirect target from step A2. Static export
   supports it; no dynamic params needed.

### D. Navigation wiring

9. **Header (UMG-only, easiest):** add a Donate entry to the `extraLinks` prop already
   passed in `apps/umg/app/layout.tsx` (lines ~104–106):
   ```tsx
   extraLinks={[
     { label: "2026 International Youth Photography Competition", href: "/how-to-enter" },
     { label: "Donate", href: "/donate" },
   ]}
   ```
   `packages/ui/Header.tsx` already renders `extraLinks` in both desktop and mobile menus
   (lines ~310 and ~468) — no shared-component change needed.
10. **Footer (optional):** the Footer meta-links column in `packages/ui/Footer.tsx`
    (the "Col 4: Meta links" block, ~line 135) currently hardcodes "About Us" / "Contact
    Us" for all three sites. To add a UMG-only "Donate" footer link cleanly, add an
    optional prop to `FooterProps` (e.g. `extraMetaLinks?: { label: string; href: string }[]`)
    and render it in that column, then pass it from `apps/umg/app/layout.tsx`. Do **not**
    hardcode "Donate" directly in `Footer.tsx` — that would leak it onto echo-media and
    international-spectrum. If footer placement isn't needed, skip this step; the header
    link is sufficient.

### E. Webhook guard (prerequisite — see CRITICAL)

11. In `docs/plugin/umg-photo-contest/includes/payment.php`, gate `umgpc_stripe_webhook`
    so it only marks a user paid for **entry-fee** sessions (check
    `$session['metadata']['purpose'] === 'entry_fee'`, or match the entry-fee price/product
    ID). Add `purpose: entry_fee` metadata to the entry-fee Payment Link in Stripe so this
    check has something to match. This ensures donations flowing through the same Stripe
    account never flip a contest user's `payment_status`.

---

## Testing

- **Webhook isolation (most important):** In Stripe **test mode**, register a test user in
  WP with email `X`. Make a **donation** checkout using email `X`. Confirm that user's
  `umgpc_payment_status` remains `unpaid` (i.e. the webhook ignored it). Then make an
  **entry-fee** checkout with email `X` and confirm it flips to `paid`. This proves the two
  paths are decoupled.
- **Happy path:** click Donate on `/donate`, complete a test-mode payment, verify Stripe
  emails a receipt and (if configured) the redirect lands on `/donate/thank-you`.
- **Nav:** Donate appears in header (desktop + mobile) and, if wired, footer — on UMG only,
  not on echo-media / international-spectrum.
- **Static export:** run the UMG production build (`output: "export"`) and confirm `/donate`
  (and `/donate/thank-you`) render as static HTML with a working external Stripe link.
- **Recurring (if enabled):** confirm a subscription is created in Stripe and renews in test
  clock.

---

## Effort & defer-or-now

- **Effort: XS** (matching the breakdown doc's rating). Recommended path is config + one
  static page + one nav line. The one real code task is the **webhook guard (step 11)**,
  which is small but should not be skipped.
- **Dependencies: none** — Stripe Payment Links are backend-agnostic and independent of the
  planned WordPress → custom-backend migration. No need to wait.
- **Recommendation: build now if donations are actually wanted.** It is genuinely a
  minutes-scale add. The only gotcha is the shared-webhook contamination risk, which the
  metadata guard resolves. Defer only the optional extras (preset-amount Checkout,
  recurring, footer link, JSON-LD) until there's demand.

---

## File map (recommended path)

| File | Change |
|------|--------|
| Stripe Dashboard | New donation Product + Payment Link (custom amount), receipts on, `purpose: donation` metadata |
| `apps/umg/lib/site/donations.ts` | New — donation link + presets config |
| `apps/umg/app/donate/page.tsx` | New — static donate page with external Stripe link |
| `apps/umg/app/donate/thank-you/page.tsx` | Optional new — post-donation confirmation / Stripe redirect target |
| `apps/umg/app/layout.tsx` | Add `{ label: "Donate", href: "/donate" }` to Header `extraLinks` (and optional Footer prop) |
| `packages/ui/Footer.tsx` | Optional — add `extraMetaLinks` prop to keep the footer link UMG-only |
| `docs/plugin/umg-photo-contest/includes/payment.php` | Guard `umgpc_stripe_webhook` to act only on `purpose: entry_fee` sessions |
| Stripe entry-fee Payment Link | Add `purpose: entry_fee` metadata (pairs with the webhook guard) |
</content>
</invoke>
