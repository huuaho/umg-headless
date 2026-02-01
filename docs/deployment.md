# Deployment Documentation

## Overview

This Next.js frontend uses static export (`output: 'export'`) and can be deployed to any static hosting provider. This guide covers deployment to SiteGround with GitHub Actions for automated deployments.

## Architecture

```
┌─────────────────┐     API calls      ┌─────────────────┐
│  Static Frontend │ ────────────────► │  WordPress API  │
│  (SiteGround)    │    at runtime     │  (SiteGround)   │
│  your-domain.com │                   │  api.your-domain│
└─────────────────┘                    └─────────────────┘
```

- **Frontend**: Static HTML/CSS/JS files served from main domain
- **WordPress**: Runs on subdomain, provides REST API for content
- **Data Flow**: Browser fetches data from WordPress API at runtime

## Prerequisites

- SiteGround hosting account
- GitHub repository for the project
- WordPress site with United Media Ingestor plugin installed

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

### 1.3 Update Environment Variable

In your Next.js project, update `.env.local`:

```
NEXT_PUBLIC_WP_API_URL=https://api.yourdomain.com/wp-json
```

### 1.4 Verify API Access

Test the API is accessible:

```
https://api.yourdomain.com/wp-json/um/v1/articles?category=world-news-politics
```

**After migration:**

- WordPress admin: `https://api.yourdomain.com/wp-admin`
- REST API: `https://api.yourdomain.com/wp-json/um/v1/...`
- Main domain (`yourdomain.com`) is now free for static files

### 1.5 Clear Main Domain (if needed)

If you used **Option B (Move)**, SiteGround removes WordPress from the main domain automatically.

If you used **Option A (Fresh Install)** and WordPress was on the main domain:

1. **Backup first**: Site Tools → Security → Backups → Create Backup
2. Go to Site → File Manager → `public_html` (main domain)
3. Delete all WordPress files (wp-admin, wp-content, wp-includes, \*.php)
4. Leave empty for the static frontend upload

**Note**: Don't delete `public_html` itself, just its contents.

### CORS Configuration

WordPress must allow API requests from the frontend domain. The origin must match **exactly** (including `www` vs non-`www`).

**How to add CORS headers:**

1. Go to WordPress admin → **Appearance** → **Theme File Editor**
2. Select `functions.php` from the right sidebar
3. Add this code at the end of the file:

```php
// Allow CORS for REST API
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $allowed_origins = [
            'https://yourdomain.com',
            'https://www.yourdomain.com',
            'http://localhost:3000',
        ];

        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        }

        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        return $value;
    });
});
```

4. Click **Update File**

**Important**: Replace `yourdomain.com` with your actual domain. Include both `www` and non-`www` versions if needed.

**Alternative**: Use a plugin like "WP CORS" for a UI-based configuration.

**Temporary testing**: To quickly test, use `header('Access-Control-Allow-Origin: *');` (allows all origins - not recommended for production).

## Step 2: Manual Deployment (First Time)

### Build the Project

```bash
npm run build
```

This creates an `out/` directory containing all static files.

### Upload to SiteGround

**Option A: File Manager**

1. Log in to SiteGround Site Tools
2. Go to Site → File Manager
3. Navigate to `public_html` for your main domain
4. Upload contents of `out/` directory (not the folder itself)

**Option B: SFTP**

1. Get FTP credentials from SiteGround Site Tools → Site → FTP Accounts
2. Connect using FileZilla or similar client
3. Upload `out/` contents to `public_html`

After upload, `public_html` should contain:

```
public_html/
├── index.html
├── about-us.html
├── search.html
├── _next/
├── favicon.ico
└── ...
```

## Step 3: GitHub Actions (Automated Deployment)

### Create Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to SiteGround

on:
  push:
    branches: [main]
  workflow_dispatch: # Manual trigger option

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
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_WP_API_URL: ${{ secrets.WP_API_URL }}

      - name: Deploy via SFTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          protocol: ftps
          local-dir: ./out/
          server-dir: ./yourdomain.com/public_html/
          dangerous-clean-slate: true
```

**Note:** The `server-dir` path depends on your SiteGround FTP structure. Connect via an FTP client (like FileZilla) to see your directory layout. Common patterns:
- `./yourdomain.com/public_html/` - if FTP root is above the domain folder
- `/public_html/` - if FTP root is the domain folder
- `./` - if FTP root is already inside public_html

### Configure GitHub Secrets

In your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add the following secrets:

| Secret         | Value                                | Source                               |
| -------------- | ------------------------------------ | ------------------------------------ |
| `FTP_SERVER`   | `yourdomain.com` or server IP        | SiteGround Site Tools → FTP Accounts |
| `FTP_USERNAME` | FTP username                         | SiteGround Site Tools → FTP Accounts |
| `FTP_PASSWORD` | FTP password                         | SiteGround Site Tools → FTP Accounts |
| `WP_API_URL`   | `https://api.yourdomain.com/wp-json` | Your WordPress subdomain             |

### Get SiteGround FTP Credentials

1. Log in to SiteGround Site Tools
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
# Build
npm run build

# Serve locally
npx serve out/

# Visit http://localhost:3000
```

## Environment Variables

| Variable                 | Purpose                     | Required At |
| ------------------------ | --------------------------- | ----------- |
| `NEXT_PUBLIC_WP_API_URL` | WordPress REST API base URL | Build time  |

Since it uses `NEXT_PUBLIC_` prefix, the value is embedded into the JavaScript bundle at build time.

## Troubleshooting

### 404 on Page Refresh

Static hosts need configuration for client-side routing. For SiteGround, add `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### CORS Errors

**"Origin not allowed" or "CORS header mismatch":**

The `Access-Control-Allow-Origin` header must **exactly** match the request origin:

| Request Origin | Allowed Origin | Works? |
|---------------|----------------|--------|
| `https://www.example.com` | `https://example.com` | ❌ No |
| `https://example.com` | `https://www.example.com` | ❌ No |
| `http://localhost:3000` | `http://localhost:3001` | ❌ No |

**To debug:**
1. Open browser DevTools → Network tab
2. Click on a failed API request
3. Check **Request Headers** → find `Origin:` value
4. Ensure this exact origin is in your CORS allowed list

**Common fix**: Add both `www` and non-`www` versions to your allowed origins in `functions.php`.

### Build Failures

- Ensure all environment variables are set in GitHub Secrets
- Check Node.js version matches local development (v20 recommended)
- Run `npm ci` instead of `npm install` for consistent dependencies

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

**Permanent Fix: Exclude REST API from cache**

Add this to your theme's `functions.php`:

```php
// Prevent caching of REST API responses (fixes CORS with multiple origins)
add_filter('rest_post_dispatch', function($response) {
    $response->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    $response->header('Pragma', 'no-cache');
    $response->header('Expires', '0');
    return $response;
});
```

This ensures each API request gets fresh CORS headers matching its origin, allowing both localhost and production to work simultaneously.

**Alternative via SiteGround:**

1. Go to **Site Tools** → **Speed** → **Caching**
2. Find **Exclude URLs from Caching**
3. Add: `/wp-json/*`

**Temporary Fix: Flush cache**

1. Go to SiteGround **Site Tools** → **Speed** → **Caching**
2. Click **Flush All Caches**
3. Retry the request

Note: Without the permanent fix, you'll need to flush cache each time you switch between localhost and production testing.

### Images/Logos Not Loading After Migration

After moving WordPress to the subdomain, any hardcoded image URLs pointing to the old domain will break.

**Example:** URLs like `https://www.yourdomain.com/wp-content/uploads/...` need to become `https://api.yourdomain.com/wp-content/uploads/...`

**Files to check:**
- `lib/mediaCompanies.ts` - Logo URLs for Header banner and Footer
- `components/Header.tsx` - Main site logo
- `components/Footer.tsx` - Footer logo

**After updating URLs:** Rebuild and redeploy since these are embedded in the JavaScript bundle at build time.

## Files

| File                           | Purpose                                   |
| ------------------------------ | ----------------------------------------- |
| `.github/workflows/deploy.yml` | GitHub Actions workflow                   |
| `out/`                         | Build output directory (git-ignored)      |
| `.env.local`                   | Local environment variables               |
| `.env.example`                 | Environment variable template             |
| `next.config.ts`               | Contains `output: 'export'` configuration |
