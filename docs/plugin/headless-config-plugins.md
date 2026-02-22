# Headless Config Plugins

WordPress plugins that configure each backend for headless operation with the Next.js frontend.

## Plugin Files

| File | Site | Localhost Port |
|------|------|---------------|
| `united-media-ingestor/` | unitedmediadc.com | 3000 |
| `em-headless-config.php` | echo-media.info | 3000 |
| `is-headless-config.php` | internationalspectrum.org | 3000 |

**UMG note:** The standalone `umg-headless-config.php` has been merged into the `united-media-ingestor/` plugin. That plugin now handles both article ingestion and headless config (CORS, cache control, redirect).

## Installation

1. In SiteGround **Site Tools** → **Site** → **File Manager**, navigate to `api.yourdomain.com/public_html/wp-content/plugins/`
2. For EM and IS: upload the `.php` file directly (no zip or folder needed)
3. For UMG: upload the entire `united-media-ingestor/` folder
4. Go to **Plugins** in wp-admin and activate the plugin

| Site | Upload to | Activate |
|------|-----------|----------|
| UMG | `api.unitedmediadc.com/.../plugins/united-media-ingestor/` | United Media Ingestor |
| Echo Media | `api.echo-media.info/.../plugins/` | EM Headless Config |
| International Spectrum | `api.internationalspectrum.org/.../plugins/` | IS Headless Config |

## What Each Plugin Does

### CORS Headers
Allows REST API requests from the site's allowed origins:
- `http://localhost:3000` (local development)
- `https://www.yourdomain.com` (production)
- `https://yourdomain.com` (production, no www)

### Cache-Control
Prevents SiteGround from caching REST API responses. Without this, cached CORS headers cause cross-origin failures when switching between dev and production.

### Frontend Redirect
Redirects all public-facing pages on `api.yourdomain.com` to `www.yourdomain.com`. The `/wp-admin` dashboard and `/wp-json` API remain accessible.

### Auto-Rebuild on Post Changes (EM & IS only)

The EM and IS plugins hook into WordPress `transition_post_status` to trigger a GitHub Actions deploy when a post is published, updated, or deleted. This keeps the static frontend in sync with WordPress content without manual rebuilds.

**Triggers rebuild when:**
- Publishing a new post (draft → publish)
- Updating a published post (publish → publish)
- Trashing a published post (publish → trash)
- Reverting to draft (publish → draft)

**Does NOT trigger for:**
- Saving drafts (draft → draft)
- Non-post types (pages, menus, etc.)

**Required setup:**

1. Create a GitHub **Fine-Grained Personal Access Token**:
   - Repository access: Only `huuaho/umg-headless`
   - Permission: **Contents → Read and write** (needed for `repository_dispatch`)

2. Add the token to each WordPress site's `wp-config.php` (before `/* That's all, stop editing! */`):
   ```php
   define('GH_REBUILD_TOKEN', 'github_pat_xxxxxxxxxxxx');
   ```

3. Upload the updated plugin and activate it.

If `GH_REBUILD_TOKEN` is not defined, the webhook is silently skipped — the rest of the plugin still works.

## Notes

- These plugins replace the CORS and redirect code previously in the theme's `functions.php`
- Using a plugin ensures the config persists regardless of which WordPress theme is active
- If adding a new allowed origin, update the `$allowed` array in the CORS section
- UMG does not have the auto-rebuild webhook (UMG aggregates via the ingestor plugin, rebuilt separately)
- UMG's headless config (CORS, cache control, redirect) is built into the United Media Ingestor plugin — no separate config plugin needed
