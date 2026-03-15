# Photo Competition — "My Hometown, My Lens"

## Overview

The UMG site (`apps/umg/`) hosts a photography competition for young photographers aged 10–30. The system is a full-stack feature spanning a Next.js frontend and a WordPress backend plugin, with Stripe payment integration and passwordless email authentication.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│                     (apps/umg/)                          │
│                                                          │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │ How to Enter  │  │   Photo     │  │  Judges Panel  │  │
│  │    Page       │  │ Submission  │  │     Page       │  │
│  └──────────────┘  │  Page       │  └────────────────┘  │
│                     │  ├ AuthForm │                       │
│                     │  └ Form     │                       │
│                     └─────────────┘                       │
│                          │                                │
│  ┌───────────────────────┼────────────────────────────┐  │
│  │           Auth Context + API Client                │  │
│  │         (lib/auth/AuthContext.tsx, api.ts)          │  │
│  └───────────────────────┼────────────────────────────┘  │
│                          │                                │
│  ┌───────────────────────┼────────────────────────────┐  │
│  │      Competition Config (lib/competitions/)        │  │
│  │      current.ts · types.ts · judges.tsx            │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────┼───────────────────────────────┘
                           │ REST API
                           ▼
┌──────────────────────────────────────────────────────────┐
│               WordPress Backend Plugin                    │
│        (docs/plugin/umg-photo-contest/)                   │
│                                                           │
│  Auth · Draft CRUD · Photo Upload · Payment · Cleanup     │
│  Namespace: /wp-json/umg/v1/                              │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Stripe    │
                    │   Checkout   │
                    └──────────────┘
```

## Pages

| Route | File | Description |
|-------|------|-------------|
| `/how-to-enter` | `app/how-to-enter/page.tsx` | Competition details, timeline, awards, venues, judges, rules, and sponsors ("Meet the Judges" heading links to `/judges-panel`) |
| `/photo-submission` | `app/photo-submission/page.tsx` | Auth gate → submission form → payment → sponsors |
| `/judges-panel` | `app/judges-panel/page.tsx` | Full judge bios with anchor-scrollable cards |

## Key Files

### Frontend (`apps/umg/`)

| File | Purpose |
|------|---------|
| `lib/competitions/types.ts` | TypeScript interfaces for competition data |
| `lib/competitions/current.ts` | 2026 competition configuration |
| `lib/competitions/judges.tsx` | Judge list with bios (JSX) |
| `lib/auth/types.ts` | Auth & submission data types |
| `lib/auth/api.ts` | API client (auth, drafts, uploads) |
| `lib/auth/AuthContext.tsx` | React context for auth state |
| `app/photo-submission/layout.tsx` | Wraps children in `AuthProvider` |
| `app/photo-submission/components/AuthForm.tsx` | Email verification form |
| `app/photo-submission/components/SubmissionForm.tsx` | Full submission form with autosave |
| `app/judges-panel/HashScroller.tsx` | Client-side hash anchor scroll utility |

### Backend (`docs/plugin/umg-photo-contest/`)

| File | Purpose |
|------|---------|
| `umg-photo-contest.php` | Plugin entry point, loads all includes |
| `includes/config.php` | JWT, Stripe, and CORS config constants |
| `includes/cors.php` | CORS headers for cross-origin requests |
| `includes/jwt.php` | Pure PHP JWT (HMAC-SHA256) implementation |
| `includes/post-types.php` | `umg_submission` custom post type |
| `includes/auth.php` | Passwordless auth endpoints |
| `includes/payment.php` | Stripe webhook + payment status |
| `includes/draft.php` | Draft CRUD, photo upload/delete, student proof |
| `includes/submission.php` | Final submission endpoint |
| `includes/cleanup.php` | Weekly cron to delete abandoned drafts |

## Competition Details (2026)

- **Theme**: "My Hometown, My Lens" — hometown as place of origin and meaning
- **Status**: Open
- **Divisions**:
  - Youth (ages 10–18): up to 3 photos, 100-word description, $50 entry
  - Young Adults (ages 19–30): up to 3 photos, 200-word description + biography, $50 entry
- **Timeline**: March 2026 (open) → August 2026 (deadline) → Sept–Oct (jury review) → October (winners)
- **Awards**: $5,000 (1st), $4,000 (2nd), $2,000 (3rd), $500 (Honorable Mention, 20 per division)
- **Photo requirements**: JPEG/JPG only, RGB color, min 2000px on longest side, max 20MB, taken after 2025
- **Exhibition venues**: Library of Congress, Smithsonian, National Press Club, Georgetown University, Johns Hopkins University

## User Flow

1. User visits `/how-to-enter` to learn about the competition
2. User clicks "Apply Now" → navigates to `/photo-submission`
3. **Step 1 — Authentication**: User enters email, receives 6-digit code, verifies
4. **Step 2 — Submission**: User fills out form (personal info, photos, biography, consents)
   - Form auto-saves every 2 seconds
   - Photos uploaded individually to WordPress Media Library
   - Student proof document upload (for youth division)
5. **Submit**: Entry finalized, status changes from `draft` → `submitted`
6. **Payment**: User redirected to Stripe payment link ($50 entry fee)
   - Payment status auto-polls every 15 seconds
   - Stripe webhook updates WordPress user meta on successful payment

## Related Documentation

- [WordPress Photo Contest Plugin](../plugin/umg-photo-contest.md) — Backend API details
- [Competition Config](./config.md) — Competition data model and configuration
- [Judges Panel](./judges.md) — Judges data and page documentation
