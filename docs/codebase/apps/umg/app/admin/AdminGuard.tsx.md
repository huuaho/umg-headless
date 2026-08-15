# apps/umg/app/admin/AdminGuard.tsx

**Purpose:** Client-side gate for the judging dashboard — sign-in prompt, "not authorized" screen, or the children.

## Responsibilities
Reads `useAuth()` and renders one of four states: a "Loading..." screen while the token restores; the reused [AuthForm](../photo-submission/components/AuthForm.tsx.md) under a "Judging Dashboard — Judges only" heading when there is no user; a "Not authorized" screen (shows the account email, offers Sign out) when `user.is_judge` is falsy; otherwise the children. UX only — the file's own comment stresses that the real security boundary is the capability check the plugin performs on every `/admin/*` REST request; anyone can log in (contest signup creates accounts freely), only users granted the judge role get past the API.

## Key exports
- `AdminGuard({ children }) -> JSX`

## Dependencies
- Internal: [lib/auth/AuthContext](../../lib/auth/AuthContext.tsx.md) (`useAuth`), [app/photo-submission/components/AuthForm](../photo-submission/components/AuthForm.tsx.md) (reused as-is, same passwordless email-code login as entrants and schools)
- External: React

## Used by
[layout.tsx](layout.tsx.md) — wraps every `/admin/*` route.

## Notes
`"use client"`. `is_judge` is optional on `User` ([lib/auth/types.ts](../../lib/auth/types.ts.md)) because older plugin builds don't return it — until the judging plugin update is deployed every logged-in user lands on "Not authorized". Admin-only pages (results) do a second check on `user.is_admin` themselves.

---
*Documented at commit bde729d.*
