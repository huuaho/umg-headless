# UMG Photo Contest — WordPress Plugin

## Overview

A WordPress plugin that provides the backend API for the UMG photo competition. Implements passwordless email authentication, draft management with photo uploads, Stripe payment verification, and automated cleanup.

**Plugin directory**: `docs/plugin/umg-photo-contest/`
**REST namespace**: `/wp-json/umg/v1/`
**WordPress backend**: `api.unitedmediadc.com`

## Installation

1. Upload the `umg-photo-contest/` folder to `wp-content/plugins/` on the WordPress backend
2. Activate "UMG Photo Contest" in wp-admin → Plugins
3. Set required constants in `wp-config.php`:

```php
// Required for Stripe webhook signature verification
define('UMGPC_STRIPE_WEBHOOK_SECRET', 'whsec_...');

// Optional — defaults to AUTH_KEY if not set
define('UMGPC_JWT_SECRET', 'your-jwt-secret');
```

## Plugin Structure

```
umg-photo-contest/
├── umg-photo-contest.php       # Entry point, loads all includes
└── includes/
    ├── config.php              # Constants (JWT, Stripe, CORS origins)
    ├── cors.php                # CORS headers and preflight handling
    ├── jwt.php                 # Pure PHP JWT (HMAC-SHA256)
    ├── post-types.php          # umg_submission CPT registration
    ├── auth.php                # Passwordless auth endpoints
    ├── payment.php             # Stripe webhook + payment status
    ├── draft.php               # Draft CRUD, photo/proof uploads
    ├── submission.php          # Final submission endpoint
    └── cleanup.php             # Weekly orphan draft cleanup cron
```

## REST API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/umg/v1/auth/request-code` | Public | Send 6-digit code to email |
| POST | `/umg/v1/auth/verify-code` | Public | Verify code, return JWT + user |
| GET | `/umg/v1/me` | Bearer | Get current authenticated user |

#### POST `/auth/request-code`

**Body**: `{ "email": "user@example.com" }`

- Creates WordPress user if not found
- Generates 6-digit code, stores in user meta
- Code expires in 15 minutes
- Sends code via `wp_mail()`

#### POST `/auth/verify-code`

**Body**: `{ "email": "user@example.com", "code": "123456" }`

**Response**:
```json
{
  "token": "eyJ...",
  "user": {
    "id": 42,
    "email": "user@example.com",
    "name": "user",
    "payment_status": "unpaid"
  }
}
```

#### GET `/me`

**Headers**: `Authorization: Bearer <token>`

Returns user object (same shape as verify-code response user).

---

### Draft Management

All draft endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/umg/v1/draft` | Load existing draft |
| PUT | `/umg/v1/draft` | Create or update draft fields |
| POST | `/umg/v1/draft/photo` | Upload a photo (max 3) |
| DELETE | `/umg/v1/draft/photo/{id}` | Remove a photo |
| POST | `/umg/v1/draft/student-proof` | Upload student verification document |
| DELETE | `/umg/v1/draft/student-proof` | Remove student proof |

#### GET `/draft`

Returns the full draft object or 404 if none exists:

```json
{
  "status": "draft",
  "division": "youth",
  "first_name": "Jane",
  "last_name": "Doe",
  "dob": "2010-05-15",
  "address": "123 Main St",
  "school": "Lincoln High",
  "grade": "10th",
  "job": "",
  "biography": "",
  "photos": [
    {
      "media_id": 101,
      "url": "https://api.unitedmediadc.com/wp-content/uploads/2026/03/photo.jpg",
      "title": "Sunset on Main Street",
      "description": "A golden sunset over my hometown's main thoroughfare."
    }
  ],
  "student_proof": {
    "media_id": 102,
    "url": "https://api.unitedmediadc.com/wp-content/uploads/2026/03/id.pdf",
    "filename": "student-id.pdf"
  },
  "consent_originality": true,
  "consent_subjects": true,
  "consent_rights": true,
  "consent_rules": true,
  "submitted_at": null
}
```

#### PUT `/draft`

**Body**: Any subset of draft fields (photos excluded — use upload endpoints).

```json
{
  "division": "youth",
  "first_name": "Jane",
  "last_name": "Doe",
  "photos": [
    { "media_id": 101, "title": "Updated Title", "description": "Updated desc" }
  ]
}
```

Note: The `photos` array in PUT only updates title and description for existing photos. Use the upload/delete endpoints to add or remove photos.

Submitted entries cannot be modified (returns 403).

#### POST `/draft/photo`

**Body**: `multipart/form-data` with `photo` file field

- Accepts JPEG only, max 20MB
- Stores up to 3 photos per submission
- Creates draft if none exists

**Response**: `{ "media_id": 101, "url": "https://..." }`

#### POST `/draft/student-proof`

**Body**: `multipart/form-data` with `student_proof` file field

- Accepts JPEG, PNG, or PDF, max 10MB
- One proof per submission (replaces if re-uploaded)

**Response**: `{ "media_id": 102, "url": "https://...", "filename": "id.pdf" }`

---

### Submission

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/umg/v1/submit` | Bearer | Finalize draft as submitted |

Changes draft status from `draft` → `submitted`, sets `submitted_at` timestamp. Cannot be re-submitted.

---

### Payment

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/umg/v1/payment-status` | Bearer | Check payment status |
| POST | `/umg/v1/stripe-webhook` | Stripe signature | Process Stripe events |

#### GET `/payment-status`

**Response**: `{ "payment_status": "paid", "payment_date": "2026-03-08 15:30:00" }`

#### POST `/stripe-webhook`

- Verifies Stripe signature (HMAC-SHA256)
- Replay protection: rejects events older than 5 minutes
- Processes `checkout.session.completed` events only
- Matches Stripe customer email to WordPress user
- Sets user meta: `umgpc_payment_status = 'paid'`

---

## Data Model

### Custom Post Type: `umg_submission`

- Not public (admin-only)
- Not queryable via REST
- Supports: title, custom-fields

### Post Meta Fields

| Meta Key | Type | Description |
|----------|------|-------------|
| `umgpc_user_id` | int | Submission owner (WP user ID) |
| `umgpc_status` | string | `draft` or `submitted` |
| `umgpc_division` | string | `youth` or `young-adults` |
| `umgpc_first_name` | string | Contestant first name |
| `umgpc_last_name` | string | Contestant last name |
| `umgpc_dob` | string | Date of birth |
| `umgpc_address` | string | Home address |
| `umgpc_school` | string | School name |
| `umgpc_grade` | string | Grade level |
| `umgpc_job` | string | Job/occupation |
| `umgpc_biography` | string | Biography (Young Adults) |
| `umgpc_photo_{1-3}_id` | int | Media Library attachment ID |
| `umgpc_photo_{1-3}_title` | string | Photo title |
| `umgpc_photo_{1-3}_description` | string | Photo description |
| `umgpc_student_proof_id` | int | Student proof attachment ID |

| `umgpc_consent_originality` | bool | Originality consent |
| `umgpc_consent_subjects` | bool | Subject consent |
| `umgpc_consent_rights` | bool | Rights usage consent |
| `umgpc_consent_rules` | bool | Rules & terms consent |
| `umgpc_submitted_at` | string | Submission timestamp |

### User Meta Fields

| Meta Key | Type | Description |
|----------|------|-------------|
| `umgpc_auth_code` | string | 6-digit verification code |
| `umgpc_auth_code_expiry` | int | Code expiration (Unix timestamp) |
| `umgpc_payment_status` | string | `unpaid` or `paid` |
| `umgpc_stripe_payment_id` | string | Stripe session ID |
| `umgpc_payment_date` | string | Payment timestamp |

## Configuration

### Constants (config.php)

| Constant | Default | Description |
|----------|---------|-------------|
| `UMGPC_JWT_SECRET` | `AUTH_KEY` | JWT signing secret |
| `UMGPC_JWT_EXPIRY` | 604800 (7 days) | JWT token lifetime |
| `UMGPC_CODE_EXPIRY` | 900 (15 min) | Verification code lifetime |
| `UMGPC_STRIPE_WEBHOOK_SECRET` | — | Must be set in wp-config.php |

### CORS Allowed Origins

Defined in `umgpc_allowed_origins()`:
- `http://localhost:3000`
- `https://www.unitedmediadc.com`
- `https://unitedmediadc.com`

## Security

- **JWT**: Pure PHP HMAC-SHA256, no external libraries
- **CORS**: Origin whitelist, preflight handling for OPTIONS requests
- **Stripe**: Webhook signature verification + 5-minute replay protection
- **File validation**: Type checking (JPEG photos, JPEG/PNG/PDF proofs), size limits
- **Draft locking**: Submitted entries cannot be modified or re-submitted

## Cleanup Cron

Runs weekly (`umgpc_cleanup_orphaned_drafts`):
- Finds drafts with `status = draft` and no activity for 90+ days
- Deletes attached media (photos + proof) from Media Library
- Deletes the draft post
- Processes up to 50 drafts per run

## Future: Judges Viewing Panel

A judges viewing panel will be built to let judges review and score submissions.

### Filtering paid submissions

- Query `umg_submission` posts where `umgpc_status = submitted`
- Join with the submission author's `umgpc_payment_status` user meta — only show submissions where `payment_status = paid`
- Unpaid submissions should be excluded from the judges' view entirely

### Payment model limitation

Payment is currently tracked **per-user** (user meta `umgpc_payment_status`), not per-submission. This works as long as each user has one submission — one payment covers their single entry.

If we later support multiple submissions per user (e.g. entering both divisions separately with separate payments), payment tracking must move to **post meta on `umg_submission`**. This would require:
- Server-side Stripe Checkout Session creation with submission ID in metadata
- Webhook rework to match payments to specific submissions instead of users
- A new post meta field (e.g. `umgpc_payment_status`) on the submission post
