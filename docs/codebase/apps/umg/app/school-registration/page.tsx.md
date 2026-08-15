# apps/umg/app/school-registration/page.tsx

**Purpose:** School-registration route — sign in, then manage the school's batch of applications. **Currently hidden (404)** while the competition is postponed.

## Responsibilities
As of the "hide competition page" commit `SchoolRegistrationPage` calls `notFound()` before returning, so `/school-registration` renders the 404 page; the flow below is intact but dormant.

When live: a client page that reads `useAuth()` and switches between [AuthForm](../photo-submission/components/AuthForm.tsx.md) (reused directly from the individual flow — no school-specific auth) and [ApplicationsCart](components/ApplicationsCart.tsx.md) (signed in). Renders a hero banner, a signed-in-as/sign-out bar, and the cart. The whole content is wrapped in `Suspense` (required for `ApplicationsCart`'s `useSearchParams()` call, per this codebase's static-export convention).

## Key exports
- `default SchoolRegistrationPage() -> JSX` — the `/school-registration` route.

## Dependencies
- Internal: [lib/auth/AuthContext](../../lib/auth/AuthContext.tsx.md) (`useAuth`), [../photo-submission/components/AuthForm](../photo-submission/components/AuthForm.tsx.md), [components/ApplicationsCart](components/ApplicationsCart.tsx.md)
- External: React (`Suspense`), `next/navigation` (`notFound`)

## Used by
App Router — route `/school-registration`; linked from a secondary "Apply as a school" CTA on [how-to-enter/page.tsx](../how-to-enter/page.tsx.md) (itself currently 404). The `AuthProvider` comes from the segment [layout.tsx](layout.tsx.md).

## Notes
**Competition postponed indefinitely (client request, 2026-08-13):** delete the `notFound()` line to restore; the segment layout's metadata is commented out alongside (grep "Competition postponed indefinitely").

`"use client"` — fully client-rendered (auth state lives in localStorage, same as the individual flow). `AuthForm` is imported directly from `photo-submission/components/` rather than duplicated — flagged as worth relocating to a shared location once a fast-follow build starts, but not done today to keep the diff additive-only.

---
*Documented at commit bde729d.*
