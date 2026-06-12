# apps/umg/app/photo-submission/components/AuthForm.tsx

**Purpose:** Passwordless sign-in form — email → 6-digit code verification.

## Responsibilities
Two-step client form:

1. **email** step — collects an email and calls `requestCode(email)` from the auth context (backend emails a 6-digit OTP).
2. **code** step — collects the code (input sanitized to digits, max 6) and calls `verifyCode(email, code)`; on success the auth context stores the JWT and sets the user, which unmounts this form (the parent page switches to SubmissionForm).

Handles loading/disabled states, shows context errors or local fallbacks, and offers a "Use a different email" reset back to step 1.

## Key exports
- `AuthForm() -> JSX`

## Dependencies
- Internal: [lib/auth/AuthContext](../../../lib/auth/AuthContext.tsx.md) (`useAuth`)
- External: React

## Used by
[photo-submission/page.tsx](../page.tsx.md) when no user is signed in.

## Notes
`"use client"`. The verify button stays disabled until exactly 6 digits are entered. Backend endpoints behind this flow: `POST /wp-json/umg/v1/auth/request-code` and `/auth/verify-code` — see the plugin doc [includes/auth.php](../../../../../plugin/umg-photo-contest/includes/auth.php.md). On verify success it intentionally does not reset `isLoading` (component unmounts).

---
*Documented at commit 1cbdce5.*
