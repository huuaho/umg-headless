# Headless Config Plugins

WordPress plugins that configure each backend for headless operation with the Next.js frontend.

## Plugin Files

| File | Site | Localhost Port |
|------|------|---------------|
| `umg-headless-config.php` | unitedmediadc.com | 3000 |
| `em-headless-config.php` | echo-media.info | 3001 |
| `is-headless-config.php` | internationalspectrum.org | 3002 |

## Installation

1. In SiteGround **Site Tools** → **Site** → **File Manager**, navigate to `api.yourdomain.com/public_html/wp-content/plugins/`
2. Upload the corresponding `.php` file directly (no zip or folder needed)
3. Go to **Plugins** in wp-admin and activate the plugin

| Site | Upload to | Activate |
|------|-----------|----------|
| UMG | `api.unitedmediadc.com/.../plugins/` | UMG Headless Config |
| Echo Media | `api.echo-media.info/.../plugins/` | EM Headless Config |
| International Spectrum | `api.internationalspectrum.org/.../plugins/` | IS Headless Config |

## What Each Plugin Does

### CORS Headers
Allows REST API requests from the site's allowed origins:
- `http://localhost:<port>` (local development)
- `https://www.yourdomain.com` (production)
- `https://yourdomain.com` (production, no www)

### Cache-Control
Prevents SiteGround from caching REST API responses. Without this, cached CORS headers cause cross-origin failures when switching between dev and production.

### Frontend Redirect
Redirects all public-facing pages on `api.yourdomain.com` to `www.yourdomain.com`. The `/wp-admin` dashboard and `/wp-json` API remain accessible.

## Notes

- These plugins replace the CORS and redirect code previously in the theme's `functions.php`
- Using a plugin ensures the config persists regardless of which WordPress theme is active
- If adding a new allowed origin, update the `$allowed` array in the CORS section
