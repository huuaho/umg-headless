# Deployment Documentation

## Overview

This Turborepo monorepo uses pnpm and static export (`output: 'export'`) for each app. Each app can be deployed independently to its own domain. This guide covers deployment to SiteGround with GitHub Actions.

## Architecture

Each app is a separate static site that fetches data from its respective WordPress backend at runtime:

| App                    | Domain                    | WordPress API                         |
| ---------------------- | ------------------------- | ------------------------------------- |
| UMG                    | unitedmediadc.com         | api.unitedmediadc.com/wp-json         |
| Echo Media             | echo-media.info           | api.echo-media.info/wp-json           |
| International Spectrum | internationalspectrum.org | api.internationalspectrum.org/wp-json |

- **Frontend**: Static HTML/CSS/JS files served from each domain
- **WordPress**: Provides REST API for content (UMG uses custom plugin, EM/IS use standard WP REST API)
- **Data Flow**: Browser fetches data from WordPress API at runtime

## Prerequisites

- SiteGround hosting account
- GitHub repository for the project
- pnpm (specified via `packageManager` in root `package.json`)
- WordPress sites configured for each app

## Step 1: Prepare WordPress Subdomain

Move WordPress to a subdomain so the main domain serves the static frontend.

### 1.1 Create the Subdomain in SiteGround

**Important**: Create the subdomain FIRST before attempting to move WordPress.

1. Log in to SiteGround → Site Tools for your domain
2. Go to **Domain** → **Subdomains**
3. Enter `api` in the subdomain field (creates `api.yourdomain.com`)
4. Click **Create**
5. SiteGround creates a new folder (e.g., `public_html/api.yourdomain.com/`)

### 1.2 Move WordPress to Subdomain

**Option A: Move Existing (Recommended)**

1. Go to **Site** → **WordPress** → **Install & Manage**
2. Find your existing WordPress installation
3. Click the three dots menu → **Move**
4. Select `api.yourdomain.com` from the domain dropdown
5. Click **Select**
6. SiteGround moves WordPress and updates all URLs automatically

**Option B: Fresh Install**

1. Go to **Site** → **WordPress** → **Install & Manage**
2. Click **Install** and select `api.yourdomain.com` as the domain
3. Complete installation
4. Install and configure the United Media Ingestor plugin
5. Import your content/settings from the old WordPress

### 1.3 Update Environment Variables

In each app's `.env.local`, point to the `api.` subdomain:

```bash
# apps/umg/.env.local
NEXT_PUBLIC_WP_API_URL=https://api.unitedmediadc.com/wp-json

# apps/echo-media/.env.local
NEXT_PUBLIC_WP_API_URL=https://api.echo-media.info/wp-json
NEXT_PUBLIC_API_MODE=wp

# apps/international-spectrum/.env.local
NEXT_PUBLIC_WP_API_URL=https://api.internationalspectrum.org/wp-json
NEXT_PUBLIC_API_MODE=wp
```

### 1.4 Update WordPress URL Settings

WordPress may still think it's on the old domain. Force it to use the subdomain by editing `wp-config.php`:

1. Go to SiteGround **Site Tools** → **Site** → **File Manager**
2. Navigate to `api.yourdomain.com/wp-config.php`
3. Add these lines near the top (after `<?php`):

```php
define('WP_HOME', 'https://api.yourdomain.com');
define('WP_SITEURL', 'https://api.yourdomain.com');
```

4. Save the file

This ensures the REST API returns correct image URLs (e.g., `https://api.yourdomain.com/wp-content/uploads/...` instead of the old domain). Without this, featured images and gallery images will fail to load on the frontend.

### 1.5 Verify API Access

Test the API is accessible:

```
https://api.yourdomain.com/wp-json/um/v1/articles?category=world-news-politics
```

**After migration:**

- WordPress admin: `https://api.yourdomain.com/wp-admin`
- REST API: `https://api.yourdomain.com/wp-json/um/v1/...`
- Main domain (`yourdomain.com`) is now free for static files

### 1.6 Clear Main Domain (if needed)

If you used **Option B (Move)**, SiteGround removes WordPress from the main domain automatically.

If you used **Option A (Fresh Install)** and WordPress was on the main domain:

1. **Backup first**: Site Tools → Security → Backups → Create Backup
2. Go to Site → File Manager → `public_html` (main domain)
3. Delete all WordPress files (wp-admin, wp-content, wp-includes, \*.php)
4. Leave empty for the static frontend upload

**Note**: Don't delete `public_html` itself, just its contents.

### CORS, Caching & Redirect Configuration

Each WordPress site needs a headless config plugin that handles CORS headers, cache-control, and frontend redirect. See [headless-config-plugins.md](plugin/headless-config-plugins.md) for full details.

1. Upload the site's plugin file to `api.yourdomain.com/wp-content/plugins/`
2. Activate in **WP Admin → Plugins**

| Site | Plugin File |
|------|-------------|
| UMG | `umg-headless-config.php` |
| Echo Media | `em-headless-config.php` |
| International Spectrum | `is-headless-config.php` |

The plugin handles:
- **CORS**: Allows requests from `localhost` and production domains
- **Cache-Control**: Prevents SiteGround from caching API responses (avoids CORS mismatches)
- **Redirect**: Sends visitors on `api.yourdomain.com` to the frontend domain (except `/wp-admin` and `/wp-json`)

## Step 2: Manual Deployment (First Time)

### Build the Project

```bash
# Build all apps
pnpm turbo run build

# Build a specific app
pnpm turbo run build --filter=umg
pnpm turbo run build --filter=echo-media
pnpm turbo run build --filter=international-spectrum
```

This creates an `out/` directory inside each app (e.g., `apps/umg/out/`).

### Upload to SiteGround

Upload the contents of the app's `out/` directory (e.g., `apps/umg/out/`) to the domain's `public_html` folder via File Manager or SFTP.

## Step 3: GitHub Actions (Automated Deployment)

### Workflow Files

Each app has its own deploy workflow:

| Workflow | Triggers |
|----------|----------|
| `deploy-umg.yml` | Push to main (apps/umg or packages changes), manual |
| `deploy-echo-media.yml` | Push to main, manual, or WordPress post change (`repository_dispatch`) |
| `deploy-international-spectrum.yml` | Push to main, manual, or WordPress post change (`repository_dispatch`) |

```yaml
# .github/workflows/deploy-echo-media.yml (EM and IS follow same pattern)
name: Deploy Echo Media to SiteGround

on:
  push:
    branches: [main]
    paths:
      - 'apps/echo-media/**'
      - 'packages/**'
  workflow_dispatch:
  repository_dispatch:
    types: [deploy-echo-media]

concurrency:
  group: deploy-echo-media
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install pnpm
        uses: pnpm/action-setup@v4

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm turbo run build --filter=echo-media
        env:
          NEXT_PUBLIC_WP_API_URL: ${{ secrets.EM_WP_API_URL }}
          NEXT_PUBLIC_API_MODE: wp

      - name: Deploy via SFTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.EM_FTP_SERVER }}
          username: ${{ secrets.EM_FTP_USERNAME }}
          password: ${{ secrets.EM_FTP_PASSWORD }}
          protocol: ftps
          local-dir: ./apps/echo-media/out/
          server-dir: ./echo-media.info/public_html/
          dangerous-clean-slate: true
```

Key points:

- `pnpm/action-setup@v4` to install pnpm
- `pnpm turbo run build --filter=<app>` to build one app with its dependencies
- `local-dir: ./apps/<app>/out/` — output is inside the app folder
- `paths` filter: only triggers on push when app or shared packages change
- EM and IS set `NEXT_PUBLIC_API_MODE: wp` (UMG uses default `custom` mode)
- `repository_dispatch` + `concurrency` on EM/IS enables auto-rebuild from WordPress (see below)

### Auto-Rebuild on WordPress Post Changes (EM & IS)

When an admin publishes, updates, or deletes a post on the EM or IS WordPress site, the headless config plugin sends a `repository_dispatch` event to GitHub, which triggers the deploy workflow automatically.

**How it works:**

1. WordPress `transition_post_status` hook detects post publish/update/delete
2. Plugin calls `POST https://api.github.com/repos/{owner}/{repo}/dispatches`
3. GitHub Actions runs the matching deploy workflow
4. `concurrency` + `cancel-in-progress: true` ensures rapid successive saves don't queue up builds

**What triggers a rebuild:**
- Publish new post (draft → publish)
- Update published post (publish → publish)
- Trash/delete published post (publish → trash)
- Unpublish (publish → draft)

**What does NOT trigger:**
- Saving a draft (draft → draft)
- Editing pages, menus, etc. (post_type !== 'post')

**Setup:** Requires a `GH_REBUILD_TOKEN` constant in each site's `wp-config.php`. See [headless-config-plugins.md](plugin/headless-config-plugins.md) for details.

### Configure GitHub Secrets

In your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add the following secrets:

Each site needs its own FTP credentials (SiteGround FTP is per-site):

**UMG:**

| Secret | Value |
|--------|-------|
| `UMG_FTP_SERVER` | Server hostname |
| `UMG_FTP_USERNAME` | FTP username |
| `UMG_FTP_PASSWORD` | FTP password |
| `UMG_WP_API_URL` | `https://api.unitedmediadc.com/wp-json` |

**Echo Media:**

| Secret | Value |
|--------|-------|
| `EM_FTP_SERVER` | Server hostname |
| `EM_FTP_USERNAME` | FTP username |
| `EM_FTP_PASSWORD` | FTP password |
| `EM_WP_API_URL` | `https://api.echo-media.info/wp-json` |

**International Spectrum:**

| Secret | Value |
|--------|-------|
| `IS_FTP_SERVER` | Server hostname |
| `IS_FTP_USERNAME` | FTP username |
| `IS_FTP_PASSWORD` | FTP password |
| `IS_WP_API_URL` | `https://api.internationalspectrum.org/wp-json` |

### Get SiteGround FTP Credentials

1. Log in to SiteGround Site Tools **for each site**
2. Go to Site → FTP Accounts
3. Create a new FTP account or use existing
4. Note the hostname, username, and password

## Alternative: SSH Deployment (Faster)

For GrowBig or GoGeek plans with SSH access:

### Workflow with rsync

```yaml
- name: Deploy via SSH
  uses: easingthemes/ssh-deploy@v5.1.0
  with:
    SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
    REMOTE_HOST: ${{ secrets.SSH_HOST }}
    REMOTE_USER: ${{ secrets.SSH_USER }}
    REMOTE_PORT: 18765
    SOURCE: "out/"
    TARGET: "/home/username/public_html/"
    ARGS: "-rlgoDzvc -i --delete"
```

### SSH Setup

1. Generate SSH key pair:
   ```bash
   ssh-keygen -t ed25519 -f siteground_deploy
   ```
2. Add public key to SiteGround:
   - Site Tools → Devs → SSH Keys Manager
   - Import the `.pub` file contents
3. Add private key to GitHub:
   - Repository Settings → Secrets → New secret
   - Name: `SSH_PRIVATE_KEY`
   - Value: Contents of private key file

## Deployment Workflow

After setup, the workflow is:

1. **Push code** to `main` branch
2. **GitHub Actions** automatically:
   - Checks out code
   - Installs dependencies
   - Builds static site with environment variables
   - Deploys to SiteGround via SFTP/SSH
3. **Site is live** within 2-3 minutes

## Testing Locally

Before deploying, test the static build:

```bash
# Build a specific app
pnpm turbo run build --filter=umg

# Serve locally
npx serve apps/umg/out/

# Visit http://localhost:3000
```

## Environment Variables

| Variable                 | Purpose                     | Required At |
| ------------------------ | --------------------------- | ----------- |
| `NEXT_PUBLIC_WP_API_URL` | WordPress REST API base URL | Build time  |
| `NEXT_PUBLIC_API_MODE` | `"wp"` for EM/IS, omit for UMG (defaults to `"custom"`) | Build time |
| `NEXT_PUBLIC_ARTICLE_META` | Controls article meta display: `"author"` shows author name, `"readtime"` (default) shows read time | Build time |

Since they use `NEXT_PUBLIC_` prefix, the values are embedded into the JavaScript bundle at build time.

**Note**: The IS deployment workflow (`deploy-international-spectrum.yml`) sets `NEXT_PUBLIC_ARTICLE_META: author` to display author names instead of read times on the homepage.

## Troubleshooting

### 404 or 403 on Page Refresh / Direct URL Access

All apps use `trailingSlash: true` in `next.config.ts`. This makes Next.js static export generate `out/articles/slug/index.html` (directory-based) instead of `out/articles/slug.html` (flat files). Apache serves `index.html` from directories naturally, so no `.htaccess` rewrite rules are needed.

If you get 403/404 on direct URL access, verify `trailingSlash: true` is set, rebuild, and redeploy.

### CORS Errors

**"Origin not allowed" or "CORS header mismatch":**

The `Access-Control-Allow-Origin` header must **exactly** match the request origin:

| Request Origin            | Allowed Origin            | Works? |
| ------------------------- | ------------------------- | ------ |
| `https://www.example.com` | `https://example.com`     | ❌ No  |
| `https://example.com`     | `https://www.example.com` | ❌ No  |
| `http://localhost:3000`   | `http://localhost:3001`   | ❌ No  |

**To debug:**

1. Open browser DevTools → Network tab
2. Click on a failed API request
3. Check **Request Headers** → find `Origin:` value
4. Ensure this exact origin is in your CORS allowed list

**Common fix**: Add both `www` and non-`www` versions to your allowed origins in the headless config plugin.

### Build Failures

- Ensure all environment variables are set in GitHub Secrets
- Check Node.js version matches local development (v20 recommended)
- Use `pnpm install --frozen-lockfile` for consistent dependencies

### SSL Certificate Errors on Subdomain

If you see `SSL_ERROR_BAD_CERT_DOMAIN` errors after creating the subdomain:

1. Go to SiteGround **Site Tools** → **Security** → **SSL Manager**
2. Find `api.yourdomain.com` in the list
3. If it shows "No SSL", click **Get SSL** → Select **Let's Encrypt** → **Get**
4. Wait a few minutes for the certificate to be issued

**Temporary workaround**: Use `http://` instead of `https://` in `.env.local` while waiting.

### WordPress Redirects to Old Domain After Move

If `api.yourdomain.com` redirects to the old domain (e.g., `www.yourdomain.com`), the WordPress URL settings weren't updated.

**Fix via wp-config.php:**

1. Go to SiteGround **Site Tools** → **Site** → **File Manager**
2. Navigate to `api.yourdomain.com/wp-config.php`
3. Add these lines near the top (after `<?php`):

```php
define('WP_HOME', 'https://api.yourdomain.com');
define('WP_SITEURL', 'https://api.yourdomain.com');
```

4. Save the file

This forces WordPress to use the subdomain URL regardless of database settings.

### FTP Connection Issues

- Verify FTP credentials are correct
- Use `ftps` protocol (not `ftp`) for secure connection
- Check if SiteGround firewall blocks your GitHub Actions IP range

### Cached CORS Headers

SiteGround caches API responses **including CORS headers**. The cache doesn't vary by `Origin` header, so only one origin works at a time. If production works but localhost fails (or vice versa), the cache is returning a mismatched `Access-Control-Allow-Origin` header.

**Permanent Fix**: The headless config plugins already include `Cache-Control: no-cache, no-store, must-revalidate` headers on all REST API responses. If you're still seeing this issue, ensure the plugin is activated.

**Alternative via SiteGround:**

1. Go to **Site Tools** → **Speed** → **Caching**
2. Find **Exclude URLs from Caching**
3. Add: `/wp-json/*`

**Temporary Fix: Flush cache**

1. Go to SiteGround **Site Tools** → **Speed** → **Caching**
2. Click **Flush All Caches**
3. Retry the request

### Images/Logos Not Loading After Migration

After moving WordPress to the subdomain, any hardcoded image URLs pointing to the old domain will break.

**Example:** URLs like `https://www.yourdomain.com/wp-content/uploads/...` need to become `https://api.yourdomain.com/wp-content/uploads/...`

**Files to check:**

- `apps/*/lib/mediaCompanies.ts` - Logo URLs for Header banner and Footer
- `packages/ui/Header.tsx` - Main site logo
- `packages/ui/Footer.tsx` - Footer logo

**After updating URLs:** Rebuild and redeploy since these are embedded in the JavaScript bundle at build time.

## Files

| File                               | Purpose                                   |
| ---------------------------------- | ----------------------------------------- |
| `.github/workflows/deploy-umg.yml` | GitHub Actions workflow for UMG           |
| `.github/workflows/deploy-echo-media.yml` | GitHub Actions workflow for Echo Media |
| `.github/workflows/deploy-international-spectrum.yml` | GitHub Actions workflow for International Spectrum |
| `apps/*/out/`                      | Build output directory (git-ignored)      |
| `apps/*/.env.local`                | Local environment variables per app       |
| `apps/umg/.env.example`            | Environment variable template             |
| `apps/*/next.config.ts`            | Contains `output: 'export'` and `trailingSlash: true` |
| `docs/plugin/*-headless-config.php` | WordPress headless config plugins (CORS, cache, redirect, auto-rebuild) |
