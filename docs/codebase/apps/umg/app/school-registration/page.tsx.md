# apps/umg/app/school-registration/page.tsx

**Purpose:** School-registration route — sign in, then manage the school's batch of applications.

## Responsibilities
Client page that reads `useAuth()` and switches between [AuthForm](../photo-submission/components/AuthForm.tsx.md) (reused directly from the individual flow — no school-specific auth) and [ApplicationsCart](components/ApplicationsCart.tsx.md) (signed in). Renders a hero banner, a signed-in-as/sign-out bar, and the cart. The whole content is wrapped in `Suspense` (required for `ApplicationsCart`'s `useSearchParams()` call, per this codebase's static-export convention).

## Key exports
- `default SchoolRegistrationPage() -> JSX` — the `/school-registration` route.

## Dependencies
- Internal: [lib/auth/AuthContext](../../lib/auth/AuthContext.tsx.md) (`useAuth`), [../photo-submission/components/AuthForm](../photo-submission/components/AuthForm.tsx.md), [components/ApplicationsCart](components/ApplicationsCart.tsx.md)
- External: React (`Suspense`)

## Used by
App Router — route `/school-registration`; linked from a secondary "Apply as a school" CTA on [how-to-enter/page.tsx](../how-to-enter/page.tsx.md). The `AuthProvider` comes from the segment [layout.tsx](layout.tsx.md).

## Notes
`"use client"` — fully client-rendered (auth state lives in localStorage, same as the individual flow). `AuthForm` is imported directly from `photo-submission/components/` rather than duplicated — flagged as worth relocating to a shared location once a fast-follow build starts, but not done today to keep the diff additive-only.

---
*Documented at commit e5821d4.*
