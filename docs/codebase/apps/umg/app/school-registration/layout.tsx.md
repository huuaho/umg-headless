# apps/umg/app/school-registration/layout.tsx

**Purpose:** Route-segment layout that scopes the school-registration auth context to `/school-registration`.

## Responsibilities
Wraps the school-registration subtree in `AuthProvider` from `lib/auth/AuthContext` — the same passwordless-login context the individual `/photo-submission` flow uses, reused as-is (no school-specific auth code). Also sets segment metadata (title/description).

## Key exports
- `default SchoolRegistrationLayout({ children }) -> JSX`
- `metadata` — title "School Registration" + description.

## Dependencies
- Internal: [lib/auth/AuthContext](../../lib/auth/AuthContext.tsx.md)
- External: none

## Used by
App Router — wraps [school-registration/page.tsx](page.tsx.md) and [school-registration/application/page.tsx](application/page.tsx.md).

## Notes
Deliberately reuses the individual flow's `AuthProvider`/`AuthContext` rather than a school-specific auth system — a school signs in with the same passwordless email-code flow as an individual applicant, just to an account that then owns many applications instead of one (see [components/ApplicationsCart.tsx](components/ApplicationsCart.tsx.md)).

---
*Documented at commit e5821d4.*
