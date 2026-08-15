# apps/umg/app/school-registration/layout.tsx

**Purpose:** Route-segment layout that scopes the school-registration auth context to `/school-registration`.

## Responsibilities
Wraps the school-registration subtree in `AuthProvider` from `lib/auth/AuthContext` — the same passwordless-login context the individual `/photo-submission` flow uses, reused as-is (no school-specific auth code). The segment `metadata` export (title "School Registration" + description) is currently **commented out** so the 404 served at these routes while the competition is postponed carries no competition SEO text.

## Key exports
- `default SchoolRegistrationLayout({ children }) -> JSX`
- ~~`metadata`~~ — commented out (see above); uncomment to restore.

## Dependencies
- Internal: [lib/auth/AuthContext](../../lib/auth/AuthContext.tsx.md)
- External: none

## Used by
App Router — wraps [school-registration/page.tsx](page.tsx.md) and [school-registration/application/page.tsx](application/page.tsx.md).

## Notes
**Competition postponed indefinitely (client request, 2026-08-13):** both pages under this layout call `notFound()`; the `AuthProvider` still mounts around the 404. Grep "Competition postponed indefinitely" to restore everything.

Deliberately reuses the individual flow's `AuthProvider`/`AuthContext` rather than a school-specific auth system — a school signs in with the same passwordless email-code flow as an individual applicant, just to an account that then owns many applications instead of one (see [components/ApplicationsCart.tsx](components/ApplicationsCart.tsx.md)).

---
*Documented at commit bde729d.*
