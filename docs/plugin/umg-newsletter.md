# UMG Newsletter — WordPress Plugin

## Overview

A WordPress plugin that provides a REST API endpoint for newsletter signups. Proxies subscription requests to the Mailchimp Marketing API so the API key stays server-side. Used by the frontend `NewsletterSignup` component in the Footer.

**Plugin directory**: `docs/plugin/umg-newsletter/`
**REST namespace**: `/wp-json/umg/v1/`
**WordPress backend**: `api.unitedmediadc.com`

## Installation

1. Upload the `umg-newsletter/` folder to `wp-content/plugins/` on the WordPress backend
2. Activate "UMG Newsletter" in wp-admin → Plugins
3. Set required constants in `wp-config.php`:

```php
define('MAILCHIMP_API_KEY', 'your-api-key-here');
define('MAILCHIMP_LIST_ID', 'your-audience-id-here');
define('MAILCHIMP_SERVER_PREFIX', 'us1');
```

### Finding Mailchimp Values

| Constant | Where to find it |
|----------|-----------------|
| `MAILCHIMP_API_KEY` | Mailchimp → Account & Billing → Extras → API keys → Create A Key |
| `MAILCHIMP_LIST_ID` | Mailchimp → Audience → Settings → Audience name and defaults → Audience ID |
| `MAILCHIMP_SERVER_PREFIX` | Your Mailchimp URL (e.g., `https://us1.admin.mailchimp.com` → `us1`) |

**Important**: The server prefix must match the datacenter in your API key. The API key ends with `-usX` (e.g., `abc123-us1`), and the prefix should match that suffix.

## Plugin Structure

```
umg-newsletter/
├── umg-newsletter.php          # Entry point, loads all includes
└── includes/
    ├── config.php              # Constants (Mailchimp, rate limit, CORS origins)
    ├── cors.php                # CORS headers and preflight handling
    └── subscribe.php           # Subscribe REST endpoint
```

## REST API Endpoint

### POST `/umg/v1/subscribe`

**Auth**: Public (no authentication required)

**Body**:
```json
{
  "email_address": "subscriber@example.com"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Please check your email to confirm your subscription."
}
```

**Already Subscribed** (200):
```json
{
  "success": true,
  "message": "You're already subscribed!"
}
```

**Error Responses**:

| Status | Code | Description |
|--------|------|-------------|
| 400 | `invalid_email` | Email validation failed |
| 400 | `compliance_block` | Email was previously unsubscribed (GDPR/CAN-SPAM) |
| 429 | `rate_limited` | Too many requests from this IP |
| 500 | `not_configured` | Mailchimp constants not set |
| 502 | `mailchimp_error` | Mailchimp API call failed |

### Request Flow

1. **Rate limit check** — Max 5 requests per IP per hour (WordPress transients, keyed by SHA-256 hash of IP)
2. **Email validation** — WordPress `is_email()`
3. **Mailchimp API call** — `POST /3.0/lists/{list_id}/members` with `status: "pending"` (double opt-in)
4. **Tag assignment** — On success, a second call applies tags via `POST /3.0/lists/{list_id}/members/{md5(email)}/tags`

### Tags Applied

| Tag | Purpose |
|-----|---------|
| `website-signup` | Source tracking |
| `umg-main` | Master list identifier |

### Double Opt-In Flow

The endpoint uses Mailchimp's `pending` status, which triggers double opt-in:

1. User submits email via the form
2. Mailchimp sends a confirmation email
3. User clicks the confirmation link
4. Subscriber status changes from `pending` to `subscribed`

This is required for CAN-SPAM compliance. Unsubscribe links are automatically included in all Mailchimp emails.

## Configuration

### Constants (config.php)

| Constant | Default | Description |
|----------|---------|-------------|
| `MAILCHIMP_API_KEY` | — | Must be set in wp-config.php |
| `MAILCHIMP_LIST_ID` | — | Must be set in wp-config.php |
| `MAILCHIMP_SERVER_PREFIX` | — | Must be set in wp-config.php |
| `UMG_NL_RATE_LIMIT` | 5 | Max requests per IP per hour |

### CORS Allowed Origins

Defined in `umg_nl_allowed_origins()`:
- `http://localhost:3000`
- `https://www.unitedmediadc.com`
- `https://unitedmediadc.com`

The CORS handler is independent from the photo contest plugin. If both plugins are active, the photo contest plugin's CORS handler covers all `/umg/v1` routes, and the newsletter plugin's response-level CORS handler is skipped to avoid duplicate headers.

## Testing

```bash
# Test the endpoint
curl -X POST https://www.api.unitedmediadc.com/wp-json/umg/v1/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email_address":"test@example.com"}'

# Check debug log for errors
tail -f wp-content/debug.log | grep "UMG Newsletter"
```

## Error Logging

All Mailchimp API errors are logged via `error_log()` with the prefix `UMG Newsletter:`. Check `wp-content/debug.log` for details.

## Files

| File | Purpose |
|------|---------|
| `docs/plugin/umg-newsletter/umg-newsletter.php` | Plugin entry point |
| `docs/plugin/umg-newsletter/includes/config.php` | Mailchimp constants, rate limit, CORS origins |
| `docs/plugin/umg-newsletter/includes/cors.php` | CORS preflight + response headers |
| `docs/plugin/umg-newsletter/includes/subscribe.php` | Subscribe endpoint + Mailchimp proxy |
| `packages/ui/NewsletterSignup.tsx` | Frontend form component |
| `packages/ui/Footer.tsx` | Footer (renders newsletter when `apiBaseUrl` is passed) |
