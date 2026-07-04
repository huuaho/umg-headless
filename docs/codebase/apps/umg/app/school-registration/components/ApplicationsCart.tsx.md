# apps/umg/app/school-registration/components/ApplicationsCart.tsx

**Purpose:** The school's application manager — list, add, delete, and pay for the whole batch in one checkout.

## Responsibilities
Lists every application the signed-in school owns (name, division, status, payment status), with edit/view and delete actions per row, an "Add another application" button, and a single **"Pay $Z total (N students)"** button — not one payment per student — shown whenever at least one application is submitted-and-unpaid. Polls the list every 15s (same interval as the individual flow's own polling) while any submitted application remains unpaid, so a completed Stripe payment shows up without a manual refresh. Reads a `?checkout=success`/`?checkout=cancelled` query param (from [lib/school/api.ts](../../../lib/school/api.ts.md)'s checkout `success_url`/`cancel_url`) to show a one-time banner on return from Stripe.

## Key exports
- `default ApplicationsCart() -> JSX`

## Dependencies
- Internal: [lib/auth/AuthContext](../../../lib/auth/AuthContext.tsx.md) (`useAuth`), [lib/school/api](../../../lib/school/api.ts.md) (`listApplications`, `createApplication`, `deleteApplication`, `createCheckoutSession`), [lib/school/types](../../../lib/school/types.ts.md) (`ApplicationSummary`)
- External: `next/navigation` (`useRouter`, `useSearchParams`), React (`useState`, `useEffect`, `useCallback`, `useRef`)

## Used by
Rendered by [../page.tsx](../page.tsx.md) once the school is signed in.

## Notes
- `ENTRY_FEE = 50` is a local constant matching the plugin's own `$50 × quantity` computation in `school.php`'s `umgpc_school_create_checkout` — kept in sync manually since the total shown here is cosmetic (Stripe computes and enforces the real charged amount server-side; this component's number is what's displayed before redirecting, not what's actually charged).
- **Load-failure vs. genuinely-empty are distinguished** (added 2026-07-03, commit 10 polish): a `loadFailed` state renders "Couldn't load your applications" + a "Try again" button, separate from the real "No applications yet" empty state — before this fix, a failed initial load looked identical to a school having zero applications.
- **Double-submit guards:** "Pay" is disabled while `isCheckingOut` is true (prevents creating two Checkout Sessions client-side, though the *authoritative* guard against duplicate Checkout Sessions is server-side — see `school.php`'s `umgpc_school_create_checkout` checkout-lock, added by the same code review that flagged this as payment-critical); "Add another" is disabled via `pendingId === -1` while creating; each row's "Delete" is disabled via `pendingId === app.id` while deleting.
- `router.push` (not the Stripe redirect) is used for internal navigation to the application edit page; `window.location.href = session.url` is used specifically for the Stripe redirect since that's leaving the app entirely.
- Full live-verification details (including the real $100 payment test): `claude-context/current-work/bulk-registration/implementation-checklist.md` (commits 7 and 9).

---
*Documented at commit e5821d4.*
