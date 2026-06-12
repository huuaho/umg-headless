# apps/umg/app/photo-submission/page.tsx

**Purpose:** Photo-submission route — orchestrates the Sign In → Submit → Payment flow with a step indicator.

## Responsibilities
Client page that reads `useAuth()` and switches between [AuthForm](components/AuthForm.tsx.md) (no user) and [SubmissionForm](components/SubmissionForm.tsx.md) (signed in). Renders the competition hero banner and a 3-step indicator ("Sign In", "Submit", "Payment") whose state derives from auth + a `submissionStep` callback (`"form" | "payment" | "complete"`) lifted up from SubmissionForm via `onStepChange`. Shows a loading screen while the auth context restores the token, and [HostingCommittees](../../components/HostingCommittees.tsx.md) below the form once signed in. The whole content is wrapped in `Suspense` with a loading fallback.

## Key exports
- `default PhotoSubmissionPage() -> JSX` — the `/photo-submission` route.

## Dependencies
- Internal: [lib/auth/AuthContext](../../lib/auth/AuthContext.tsx.md) (`useAuth`), [components/AuthForm](components/AuthForm.tsx.md), [components/SubmissionForm](components/SubmissionForm.tsx.md), [components/HostingCommittees](../../components/HostingCommittees.tsx.md)
- External: React (`Suspense`, `useState`, `useCallback`)

## Used by
App Router — route `/photo-submission`; linked from the "Apply Now" CTA on [how-to-enter/page.tsx](../how-to-enter/page.tsx.md). The `AuthProvider` comes from the segment [layout.tsx](layout.tsx.md).

## Notes
`"use client"` — the page is fully client-rendered (auth state lives in localStorage). Step index logic: 0 = not signed in, 1 = form, 2 = payment; `complete` renders all steps as checked. Passes `user.email`/`name` and `logout` down to SubmissionForm.

---
*Documented at commit 1cbdce5.*
