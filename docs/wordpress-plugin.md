# UMG Headless Config Plugin

WordPress plugin that configures the backend for headless operation with the Next.js frontend.

## Installation

1. In SiteGround **Site Tools** → **Site** → **File Manager**, navigate to `api.unitedmediadc.com/public_html/wp-content/plugins/`
2. Upload `umg-headless-config.php` directly (no zip or folder needed)
3. Go to **Plugins** in wp-admin and activate **UMG Headless Config**

## What It Does

### CORS Headers
Allows REST API requests from:
- `http://localhost:3000` (local development)
- `https://www.unitedmediadc.com` (production)
- `https://unitedmediadc.com` (production, no www)

### Cache-Control
Prevents SiteGround from caching REST API responses. Without this, cached CORS headers cause cross-origin failures when switching between dev and production.

### Frontend Redirect
Redirects all public-facing pages on `api.unitedmediadc.com` to `www.unitedmediadc.com`. The `/wp-admin` dashboard and `/wp-json` API remain accessible.

## Notes

- This plugin replaces the CORS and redirect code previously in the theme's `functions.php`
- Using a plugin ensures the config persists regardless of which WordPress theme is active
- If adding a new allowed origin, update the `$allowed` array in the CORS section
