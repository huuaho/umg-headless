# Payment Pipeline — "Fix Now" Remediation

Implementation breakdown for the three functional payment bugs (I-2, I-3, I-5) from `docs/future-work/payment-pipeline-audit.md`. Follow each section top to bottom; the "Combined change set" at the end lists every file in commit order.

---

## I-2 — Payment lost when payer email ≠ login email

### (a) Root cause

The webhook identifies the paying user **only** by the email on the Stripe session:

- `docs/plugin/umg-photo-contest/includes/payment.php:126-131` — reads `customer_email` (falling back to `customer_details.email`).
- `docs/plugin/umg-photo-contest/includes/payment.php:138` — `get_user_by('email', $customer_email)`.
- `docs/plugin/umg-photo-contest/includes/payment.php:139-142` — on no match, returns `received: true` and drops the payment.

The frontend only *prefills* the email, so it is editable and wallet flows (Link, Apple/Google Pay, PayPal) often settle under a different address:

- `apps/umg/app/photo-submission/components/SubmissionForm.tsx:487`
  ```ts
  const stripeUrl = `${competition.stripePaymentLink}?prefilled_email=${encodeURIComponent(user.email)}`;
  ```

There is no stable identity carried through checkout, so a mismatched email = lost entry.

**Fix:** pass the WP user id as Stripe's `client_reference_id` query param, and match on it first in the webhook, keeping the email match as a fallback.

### (b) Precise code change

#### File 1 — `apps/umg/app/photo-submission/components/SubmissionForm.tsx`

The `user` prop is typed `{ email: string; name: string }` (`SubmissionForm.tsx:37`) and has **no `id`**. The WP user id is on `authUser` from `useAuth()` (`SubmissionForm.tsx:48`), whose type `User` includes `id: number` (`apps/umg/lib/auth/types.ts:1-6`). So build the id from `authUser?.id`.

Before (`SubmissionForm.tsx:486-487`):
```ts
  const entryFee = selectedDivision.entryFee;
  const stripeUrl = `${competition.stripePaymentLink}?prefilled_email=${encodeURIComponent(user.email)}`;
```

After:
```ts
  const entryFee = selectedDivision.entryFee;
  const stripeUrl = (() => {
    const params = new URLSearchParams({ prefilled_email: user.email });
    // client_reference_id lets the webhook match the payment to this WP user
    // even if the payer settles under a different email (wallets, Link, PayPal).
    if (authUser?.id) {
      params.set("client_reference_id", String(authUser.id));
    }
    return `${competition.stripePaymentLink}?${params.toString()}`;
  })();
```
(`URLSearchParams` handles the encoding, so `encodeURIComponent` is no longer needed.)

#### File 2 — `docs/plugin/umg-photo-contest/includes/payment.php`

`client_reference_id` is present on the checkout session object for **both** `checkout.session.completed` and `checkout.session.async_payment_succeeded`, as `$session['client_reference_id']`. `$session` is already extracted at line 112.

Replace the identity/match block. Before (`payment.php:126-142`):
```php
    $customer_email = isset($session['customer_email']) ? sanitize_email($session['customer_email']) : '';

    // Also check customer_details.email as fallback
    if (!$customer_email && !empty($session['customer_details']['email'])) {
        $customer_email = sanitize_email($session['customer_details']['email']);
    }

    if (!$customer_email) {
        return new WP_Error('webhook_error', 'No customer email in session.', array('status' => 400));
    }

    // Find WP user by email
    $user = get_user_by('email', $customer_email);
    if (!$user) {
        // User hasn't signed up yet - this is unusual but not an error for Stripe
        return rest_ensure_response(array('received' => true));
    }
```

After:
```php
    $customer_email = isset($session['customer_email']) ? sanitize_email($session['customer_email']) : '';

    // Also check customer_details.email as fallback
    if (!$customer_email && !empty($session['customer_details']['email'])) {
        $customer_email = sanitize_email($session['customer_details']['email']);
    }

    // Prefer client_reference_id (the WP user id we set on the payment link):
    // it survives payer-email edits and wallet flows that settle under a
    // different email. Fall back to email so in-flight sessions created before
    // this change (no client_reference_id) still resolve.
    $user = null;

    $client_reference_id = isset($session['client_reference_id'])
        ? sanitize_text_field($session['client_reference_id'])
        : '';
    if ($client_reference_id !== '' && ctype_digit($client_reference_id)) {
        $user = get_user_by('id', (int) $client_reference_id);
    }

    if (!$user && $customer_email) {
        $user = get_user_by('email', $customer_email);
    }

    if (!$user) {
        // No user matched by id or email. Payment may be orphaned (see I-5).
        // Acknowledge so Stripe stops retrying; the miss is logged below.
        error_log(sprintf(
            '[umgpc webhook] UNMATCHED payment: event=%s type=%s email=%s amount=%s session=%s client_ref=%s',
            isset($event['id']) ? $event['id'] : '(none)',
            $event['type'],
            $customer_email ?: '(none)',
            isset($session['amount_total']) ? $session['amount_total'] : '(none)',
            isset($session['id']) ? $session['id'] : '(none)',
            $client_reference_id ?: '(none)'
        ));
        return rest_ensure_response(array('received' => true));
    }
```

Note: the old code returned a `400` "No customer email in session" when email was absent. Under the new logic that early return is removed — a session with no email but a valid `client_reference_id` should now succeed, and one with neither falls through to the logged no-match path (this is the I-5 change; the `error_log` line above is the same one referenced in I-5(b)).

Also update the docblock at `payment.php:57` ("matched by customer_email") to "matched by client_reference_id, falling back to customer_email".

### (c) Edge cases & regression risks

- **In-flight sessions from before deploy** carry no `client_reference_id` → they hit the email fallback, preserving today's behavior. No regression.
- **`authUser` is null** when the URL is built → `client_reference_id` is simply omitted and the flow degrades to the email-only match (current behavior). In practice `authUser` is populated on the submitted/payment screen (payment status is read from it at `SubmissionForm.tsx:478`), so this is defensive only.
- **User id must be the WP user id.** `authUser.id` is the `User.id` from `types.ts`, which the plugin's `/me` returns as the WP user ID — the exact key `get_user_by('id', …)` expects. Do not use the prop `user` (no `id`).
- **`ctype_digit` guard** prevents `get_user_by('id', …)` being called with junk if the param is ever tampered with; a non-numeric value just falls back to email.
- **Wrong id (tampering).** A crafted `client_reference_id` pointing at another user could credit the wrong account. This matches the existing trust model (the payment link is unauthenticated today and email was equally forgeable) and is acceptable for the "fix now" pass; server-side association moves to the custom backend.
- **`amount_total`** is informational in the log only; not used for matching.

### (d) Manual verification / test plan

Use Stripe **test mode** (test payment link + test webhook secret).

1. **Happy path, matching email:** sign in as a test user, submit, click Pay, complete with card `4242 4242 4242 4242` using the same email. Confirm user flips to `paid`. (Regression check.)
2. **Mismatch, id wins:** on the checkout page, change the email field to a different address (or pay via Link/wallet under another email). Confirm the user still flips to `paid` — proves `client_reference_id` matched. Verify the payment link URL in the browser contains `client_reference_id=<id>`.
3. **Fallback still works:** temporarily craft a checkout **without** `client_reference_id` (e.g. open the raw `stripePaymentLink` with only `prefilled_email`) and pay with the login email. Confirm the email fallback flips the user to `paid`.
4. **No match logs (ties into I-5):** pay with both an unknown email and no `client_reference_id`; confirm the user is untouched and an `[umgpc webhook] UNMATCHED payment` line appears in the PHP error log.
5. **Async method:** repeat test 2 with an async test method if available (or use Stripe CLI `stripe trigger checkout.session.async_payment_succeeded`) and confirm `client_reference_id` is read from the async event object too.

### (e) Rollout ordering & coordination

- Frontend and plugin changes are **mutually compatible in either order** (webhook falls back to email; frontend URL param is ignored by an un-updated webhook). Prefer deploying the **plugin first**, then the frontend, so that the moment links start carrying `client_reference_id` the webhook already understands it.
- **No Stripe Dashboard change is required for I-2 itself.** Stripe forwards `client_reference_id` on the payment-link URL automatically. (The separate async-event subscription is I-1 and already tracked.)
- After deploy, watch the error log for `UNMATCHED payment` lines to catch any residual mismatches.

---

## I-3 — "Check payment" button reads stale state

### (a) Root cause

`handleCheckPayment` awaits `refreshUser()` then reads the **closed-over** `authUser` inside a `setTimeout`:

- `apps/umg/app/photo-submission/components/SubmissionForm.tsx:503-521` — after `await refreshUser()`, the `setTimeout` callback checks `authUser?.payment_status !== "paid"` (line 511). `authUser` is captured from the current render, and `refreshUser()` only calls `setUser` internally (`AuthContext.tsx:104-110`), which schedules a re-render but does **not** update the variable already closed over. So even on a successful payment the button reports "Payment not yet detected."

`refreshUser` currently returns `Promise<void>` (`AuthContext.tsx:29`, `100-110`), giving the caller no access to the fresh user.

**Fix:** make `refreshUser()` return the fresh `User` (or `null`) and branch on the returned value.

### (b) Precise code change

#### File 1 — `apps/umg/lib/auth/AuthContext.tsx`

Interface, before (`AuthContext.tsx:29`):
```ts
  refreshUser: () => Promise<void>;
```
After:
```ts
  refreshUser: () => Promise<User | null>;
```

Implementation, before (`AuthContext.tsx:100-110`):
```ts
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const u = await fetchCurrentUser(token);
      setUser(u);
    } catch (err) {
      if (err instanceof CompetitionApiError && err.status === 401) {
        logout();
      }
    }
  }, [token, logout]);
```
After:
```ts
  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (!token) return null;
    try {
      const u = await fetchCurrentUser(token);
      setUser(u);
      return u;
    } catch (err) {
      if (err instanceof CompetitionApiError && err.status === 401) {
        logout();
      }
      return null;
    }
  }, [token, logout]);
```
(`User` is already imported at `AuthContext.tsx:11`.)

#### File 2 — `apps/umg/app/photo-submission/components/SubmissionForm.tsx`

Before (`SubmissionForm.tsx:503-521`):
```ts
  const handleCheckPayment = async () => {
    setIsCheckingPayment(true);
    setPaymentPollError("");

    try {
      await refreshUser();
      setTimeout(() => {
        setIsCheckingPayment(false);
        if (authUser?.payment_status !== "paid") {
          setPaymentPollError(
            "Payment not yet detected. If you just paid, please wait a moment and try again.",
          );
        }
      }, 100);
    } catch {
      setIsCheckingPayment(false);
      setPaymentPollError("Could not check payment status. Please try again.");
    }
  };
```
After:
```ts
  const handleCheckPayment = async () => {
    setIsCheckingPayment(true);
    setPaymentPollError("");

    try {
      const fresh = await refreshUser();
      setIsCheckingPayment(false);
      if (fresh?.payment_status !== "paid") {
        setPaymentPollError(
          "Payment not yet detected. If you just paid, please wait a moment and try again.",
        );
      }
    } catch {
      setIsCheckingPayment(false);
      setPaymentPollError("Could not check payment status. Please try again.");
    }
  };
```
The `setTimeout` is removed — it existed only to defer reading the stale closure and is no longer needed now that we branch on the returned value. When `fresh.payment_status === "paid"`, no error is set and the surrounding render (driven by `paymentStatus` at `SubmissionForm.tsx:478`, `539`) switches to the "Fully complete" view on the re-render triggered by `setUser`.

### (c) Edge cases & regression risks

- **`refreshUser` returns `null`** when there is no token or the fetch fails/401s. `null?.payment_status !== "paid"` is `true`, so the user sees "Payment not yet detected" — correct, non-crashing behavior. A 401 also triggers `logout()` inside `refreshUser`, unmounting this view.
- **Auto-poll unaffected.** The 15s interval (`SubmissionForm.tsx:492-494`) calls `refreshUser().catch(() => {})` and ignores the return value; the new return type is backward compatible.
- **Other `refreshUser` callers.** Search confirms the only callers are the poll and `handleCheckPayment`. Widening the return type from `void` to `User | null` is non-breaking for `void`-ignoring callers.
- **No race with `setUser`.** We branch on the returned `fresh` value, not on React state, so the result is correct within the same tick regardless of when the re-render lands.

### (d) Manual verification / test plan

1. Reach the "Complete Your Payment" screen (submit an entry as an unpaid user).
2. In another tab, mark the user paid (complete a Stripe test payment, or set `umgpc_payment_status` = `paid` for the test user in WP).
3. Click **"I've completed payment - check status."** Expect: within one request it transitions to the "Your Application is Fully Submitted" view, with **no** "Payment not yet detected" message. (Before the fix, it always showed the error even when paid.)
4. Click the button while still genuinely unpaid → expect the "Payment not yet detected" amber message.
5. Simulate a network failure / expired token → expect "Could not check payment status" (catch branch) or logout on 401.

### (e) Rollout ordering & coordination

- Pure frontend; **no Stripe/Dashboard coordination.** Ship the two files together (the `AuthContext` type change and its consumer). No plugin dependency.

---

## I-5 — Unmatched webhook payments leave no trace

### (a) Root cause

On the no-user-match path the webhook silently acknowledges and returns:

- `docs/plugin/umg-photo-contest/includes/payment.php:139-142`
  ```php
  $user = get_user_by('email', $customer_email);
  if (!$user) {
      // User hasn't signed up yet - this is unusual but not an error for Stripe
      return rest_ensure_response(array('received' => true));
  }
  ```

There is no logging, so a payment orphaned by I-2 (or any other mismatch) is invisible and unreconcilable — money in, no record of who/what.

**Fix:** `error_log` the event id, type, email, and amount before returning on the no-match path.

### (b) Precise code change

This is implemented by the **same edit as I-2 File 2** — the rewritten no-match branch already contains the `error_log` call:

```php
    if (!$user) {
        // No user matched by id or email. Payment may be orphaned (see I-5).
        // Acknowledge so Stripe stops retrying; the miss is logged below.
        error_log(sprintf(
            '[umgpc webhook] UNMATCHED payment: event=%s type=%s email=%s amount=%s session=%s client_ref=%s',
            isset($event['id']) ? $event['id'] : '(none)',
            $event['type'],
            $customer_email ?: '(none)',
            isset($session['amount_total']) ? $session['amount_total'] : '(none)',
            isset($session['id']) ? $session['id'] : '(none)',
            $client_reference_id ?: '(none)'
        ));
        return rest_ensure_response(array('received' => true));
    }
```

Fields logged: **event id** (`$event['id']`), **type** (`$event['type']`), **email** (`$customer_email`), **amount** (`$session['amount_total']`, in the smallest currency unit — e.g. `5000` = $50.00). `session` id and `client_ref` are added as bonus reconciliation keys. Amount is intentionally logged so a reconciler can confirm it was the $50 entry fee.

If I-2 is deferred and this is shipped alone, apply just the logging to the existing branch at `payment.php:139-142`:
```php
    $user = get_user_by('email', $customer_email);
    if (!$user) {
        error_log(sprintf(
            '[umgpc webhook] UNMATCHED payment: event=%s type=%s email=%s amount=%s session=%s',
            isset($event['id']) ? $event['id'] : '(none)',
            $event['type'],
            $customer_email ?: '(none)',
            isset($session['amount_total']) ? $session['amount_total'] : '(none)',
            isset($session['id']) ? $session['id'] : '(none)'
        ));
        return rest_ensure_response(array('received' => true));
    }
```
(But the intended sequencing is to ship I-2 and I-5 in the same `payment.php` commit, per the combined set below.)

### (c) Edge cases & regression risks

- **No PII beyond what Stripe already holds.** The email is the payer email; it is written to the server error log only. Acceptable for operational reconciliation; if log retention/PII is a concern raise it for the custom-backend pass, but do not drop the email — it is the key reconciliation field.
- **`error_log` requires PHP logging enabled.** On the WP host confirm `log_errors = On` and a writable `error_log` target (or WP `WP_DEBUG_LOG`). If disabled, the call is a silent no-op — verify during rollout (test plan step below).
- **Still returns `received: true`.** We must not return an error status here or Stripe will retry indefinitely; behavior toward Stripe is unchanged, only observability is added.
- **Log volume** is negligible (only genuine misses log), so no noise/rate concern.

### (d) Manual verification / test plan

1. In Stripe **test mode**, trigger a settlement event that matches no user: e.g. `stripe trigger checkout.session.completed` with a payer email not in WP and no `client_reference_id` (or pay a test link with a throwaway email).
2. Tail the PHP error log (`tail -f` on the host's PHP/`error_log`, or the WP `debug.log`). Confirm a line like:
   `[umgpc webhook] UNMATCHED payment: event=evt_… type=checkout.session.completed email=nobody@example.com amount=5000 session=cs_… client_ref=(none)`.
3. Confirm the webhook still responds `200 {"received":true}` (check the Stripe Dashboard event delivery / CLI output).
4. Positive control: a matching payment should **not** produce an UNMATCHED line.

### (e) Rollout ordering & coordination

- Ships in the **same `payment.php` commit as I-2** (they touch the same block). No Stripe Dashboard action. Just confirm server-side error logging is enabled so the lines are actually captured, and note the log location for whoever runs reconciliation.

---

## Combined change set

Every file touched across I-2, I-3, I-5, in commit order:

1. **`docs/plugin/umg-photo-contest/includes/payment.php`** *(I-2 + I-5, one commit)* — match `client_reference_id` first then fall back to email; `error_log` the no-match path; update the docblock at line 57. **Deploy this plugin change first.**
2. **`apps/umg/lib/auth/AuthContext.tsx`** *(I-3)* — `refreshUser()` returns `User | null`.
3. **`apps/umg/app/photo-submission/components/SubmissionForm.tsx`** *(I-2 + I-3)* — add `client_reference_id=<authUser.id>` to `stripeUrl`; rewrite `handleCheckPayment` to branch on the returned fresh user.

Suggested commits:
- Commit A (plugin): files 1 — I-2 + I-5.
- Commit B (frontend): files 2 & 3 — I-3, plus the I-2 URL change.

Deploy order: plugin (A) → frontend (B). No Stripe Dashboard changes are required for these three items (the async-event subscription is the separate I-1 ops task). After deploy, monitor the PHP error log for `UNMATCHED payment` lines.
