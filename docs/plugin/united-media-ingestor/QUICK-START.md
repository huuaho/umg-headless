# Quick Start Guide — United Media Ingestor

Last updated: 2026-01-04

## Fast Track: Run Server-Side Backfill

**For quickest completion with automatic bad article skipping:**

### 1. Configure Settings
Navigate to: `UM Articles → Ingestor Control → Settings`

Set:
- **Backfill Mode:** `Single Article (simple, slower)`
- **Backfill Pages Per Run:** `25` to `50`
- Click **Save Settings**

### 2. Start Server Backfill
Scroll to: **Server-Side Backfill** section

Click: **🚀 Start Server Backfill**

### 3. Monitor Progress (Optional)
- Page auto-refreshes every 10 seconds
- Shows: Started time, Last run, Next run
- **You can close the browser** - it runs server-side!

### 4. Check Back Later
- Expected completion: 30-60 minutes for 2,000+ articles
- Auto-stops when done
- Completion notification shown in admin

---

## What Each Setting Does

### Backfill Mode

**Batch (with binary search)** - Default
- Fetches 25-100 articles per API call
- Uses binary search to find corrupt articles
- Complex but fast
- Best for: Clean sites with few errors

**Single Article (simple, slower)** - Recommended
- Fetches 1 article per API call
- Skips bad articles after 3 retries
- Simple and reliable
- Best for: Sites with corrupt articles

### Backfill Pages Per Run

Controls how many articles to process per batch:
- **Batch Mode:** Articles per batch (e.g., 25 = fetch 25 at once)
- **Single-Article Mode:** API calls per run (e.g., 25 = 25 separate API calls)

**Recommended:**
- Start with `25`
- Increase to `50` if no errors
- Lower to `10` if seeing timeouts

---

## Button Overview

### Server-Side Backfill (Recommended)
- **What:** Automated background processing via WordPress cron
- **Speed:** Runs every 60 seconds
- **Duration:** ~30-60 minutes total
- **Browser:** Can close after starting
- **Auto-stops:** Yes, when complete

### Run Continuous (Alternative)
- **What:** JavaScript loop making AJAX calls
- **Speed:** Continuous (faster)
- **Duration:** ~10-20 minutes total
- **Browser:** Must stay open
- **Auto-stops:** Yes, when complete

### Run Single Batch (Manual)
- **What:** Process one batch manually
- **Speed:** One batch only
- **Use for:** Testing, troubleshooting

---

## Troubleshooting

### "No more articles" but sites show more articles
**Solution:** Reset backfill state and start fresh
1. Click **Reset Backfill**
2. Confirm reset
3. Start server backfill again

### Server backfill stuck/not running
**Check:**
1. Is WordPress cron running? (Check with a cron plugin)
2. Is "Active" status shown? (Should show green banner)
3. Check "Next run" time - should be ~60 seconds

**Fix:**
1. Click **Stop Server Backfill**
2. Wait 10 seconds
3. Click **Start Server Backfill** again

### Too many errors/skipped articles
**Solutions:**
1. Switch to **Single Article mode** (if not already)
2. Lower **Backfill Pages Per Run** to `10`
3. Check "Last Error" in Current Status table
4. Increase **HTTP Timeout** in Settings (try `90` or `120` seconds)

### Want to start over completely
1. Click **Delete All Articles & Reset State** (Danger Zone)
2. Confirm deletion
3. Reconfigure settings
4. Start server backfill

---

## After Backfill Completes

### View Articles
Navigate to: `UM Articles → All UM Articles`

### Check REST API
Visit: `https://your-site.local/wp-json/um/v1/articles?per_page=10`

### Use Frontend Component
Copy contents of `divi-category-section.html` into Divi Code Module

### Check for Unmapped Categories
Look for "Unmapped Categories" section in admin (if added)

---

## Performance Tips

**For fastest completion:**
- Use **Single Article mode**
- Set **Pages Per Run** to `50`
- Use **Server-Side Backfill** (runs every minute)
- Expected: 2,000 articles in ~30-40 minutes

**For most reliable:**
- Use **Single Article mode**
- Set **Pages Per Run** to `25`
- Monitor the **Last Error** field
- Expect some articles skipped (corrupt files on remote)

**For debugging:**
- Use **Single Article mode**
- Set **Pages Per Run** to `1`
- Watch admin page for detailed progress
- Check status after each run

---

## Common Questions

**Q: Can I stop and resume backfill?**
A: Yes! State is saved. Click stop anytime, click start later to resume.

**Q: What if my computer goes to sleep?**
A: Server backfill continues on the server. Your computer doesn't matter.

**Q: Do I need to keep WordPress admin open?**
A: No for server backfill. Yes for "Run Continuous".

**Q: How do I know it's working?**
A: Check "Local Count" in status table - should increase each minute.

**Q: What happens to bad/corrupt articles?**
A: In single-article mode: Logged and skipped after 3 retries.

**Q: Will this slow down my site?**
A: No - runs in background, minimal resource usage per batch.

---

## Files Modified (2026-01-04)

- `includes/config.php` - Added `UMI_BACKFILL_MODE` constant
- `includes/http.php` - Added `um_fetch_single_article()` function
- `includes/backfill.php` - Added `um_run_backfill_single_article()` and routing
- `includes/cron.php` - Added server backfill cron infrastructure
- `includes/admin-endpoints.php` - Added settings + server backfill UI

See `CLAUDE.md` and `PLANNING.md` for detailed technical documentation.
