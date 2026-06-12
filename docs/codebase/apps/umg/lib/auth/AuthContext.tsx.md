# apps/umg/lib/auth/AuthContext.tsx

**Purpose:** React context managing competition auth state — JWT persistence, passwordless login, and user refresh.

## Responsibilities
`AuthProvider` holds `{ user, token, isLoading, error }`. On mount it restores the JWT from `localStorage` (key `umgpc_token`) and validates it via `fetchCurrentUser` (`GET /me`); invalid tokens are silently dropped. Exposes actions:

- `requestCode(email)` — sends the OTP email; sets `error` and rethrows on failure.
- `verifyCode(email, code)` — exchanges the code for `{token, user}`, persists the token, sets state.
- `logout()` — clears token, user, and error.
- `refreshUser()` — re-fetches `/me` (used to poll `payment_status`); auto-logs-out on a 401.
- `clearError()`.

`useAuth()` returns the context and throws if used outside the provider.

## Key exports
- `AuthProvider({ children }) -> JSX`
- `useAuth() -> AuthContextValue` (user, token, isLoading, error, requestCode, verifyCode, logout, refreshUser, clearError)

## Dependencies
- Internal: [api.ts](api.ts.md) (requestCode/verifyCode/fetchCurrentUser, `CompetitionApiError`), [types](types.ts.md)
- External: React (context/hooks), browser `localStorage`

## Used by
Mounted by [app/photo-submission/layout.tsx](../../app/photo-submission/layout.tsx.md); consumed by [photo-submission/page.tsx](../../app/photo-submission/page.tsx.md), [AuthForm](../../app/photo-submission/components/AuthForm.tsx.md), and [SubmissionForm](../../app/photo-submission/components/SubmissionForm.tsx.md).

## Notes
`"use client"`. `isLoading` is true only during the initial token restoration, not during requestCode/verifyCode (forms manage their own spinners). The JWT lives in localStorage (XSS-readable — acceptable for this low-stakes flow); only the `/photo-submission` segment mounts the provider, so the rest of the static site does no auth work.

---
*Documented at commit 1cbdce5.*
