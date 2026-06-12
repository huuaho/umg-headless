# packages/ui/NewsletterSignup.tsx

**Purpose:** Email subscription form ("Stay Updated") that posts to the WordPress newsletter endpoint.

## Responsibilities
- Renders an email input + Subscribe button with `idle / loading / success / error` states.
- Client-side sanity check (`@` present) before submitting.
- `POST {apiBaseUrl}/umg/v1/subscribe` with JSON body `{ email_address }`; expects `{ success, message }` back.
- On success, replaces the form with the server's confirmation message; on error, shows the server message or a generic/connection fallback.

## Key exports
- `NewsletterSignup({ apiBaseUrl })` (default) — `apiBaseUrl` is the WP REST root (e.g., `https://api.unitedmediadc.com/wp-json`).

## Dependencies
- Internal: none
- External: `react` (native `fetch`)

## Used by
- [Footer.tsx](Footer.tsx.md) — rendered only when the app passes `apiBaseUrl` (currently UMG only).
- Also exported directly from the barrel [index.ts](index.ts.md) for standalone use.

## Notes
- `"use client"` component; network IO on submit.
- The `/umg/v1/subscribe` endpoint is implemented by the **umg-newsletter** WP plugin: [../../plugin/umg-newsletter/umg-newsletter.php.md](../../plugin/umg-newsletter/umg-newsletter.php.md) (plugin source ships from `docs/plugin/umg-newsletter/`).
- Button disabled while loading; success state is terminal (no way to subscribe a second address without reload).

---
*Documented at commit 1cbdce5.*
