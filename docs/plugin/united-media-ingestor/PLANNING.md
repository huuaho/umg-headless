# United Media Ingestor — Planning Document

Last updated: 2026-01-04

## Current Status

**Version:** 1.0.0 (Single-Article Mode + Server Backfill Complete)
**Environment:** Development (Local)
**Primary Goal:** Create a complete local archive of all articles from child sites with minimal data loss

---

## Recent Implementation Summary

### ✅ Completed 2026-01-04: Single-Article Mode + Server-Side Backfill

#### Problem
- Binary search is complex and can be confusing to debug
- "Run Continuous" requires keeping browser page open
- Need simpler fallback for sites with many corrupt articles
- Need fully automated background processing

#### Solution 1: Single-Article Mode

**Simple alternative to batch mode with binary search:**

**Implementation:**
- **`includes/http.php`** - Added `um_fetch_single_article($base, $offset)`
  - Always fetches `per_page=1`
  - Automatically retries 3 times
  - Returns same format as batch fetching

- **`includes/backfill.php`** - Added `um_run_backfill_single_article()`
  - Fetches one article at a time
  - On failure after 3 retries: logs and skips article
  - Uses simple offset counter instead of page numbers
  - No binary search state needed

- **`includes/config.php`** - Added `UMI_BACKFILL_MODE` constant
  - Options: `'batch'` (default) or `'single'`
  - Reads from `um_backfill_mode` option

- **`includes/admin-endpoints.php`** - Added settings dropdown
  - "Batch (with binary search)" vs "Single Article (simple, slower)"
  - Explains trade-offs in description
  - Saves to `um_backfill_mode` option

**Mode Routing:**
```php
function um_run_backfill_batch($sites) {
    if (UMI_BACKFILL_MODE === 'single') {
        return um_run_backfill_single_article($sites);
    }
    // Otherwise use batch mode
}
```

**Benefits:**
- Much simpler to understand and debug
- Perfect for sites with many corrupt articles
- Predictable behavior (one article = one API call)
- No complex state management

**Trade-offs:**
- Slower (more API calls)
- But more reliable for problematic sites

#### Solution 2: Server-Side Backfill

**Fully automated background processing:**

**Implementation:**
- **`includes/cron.php`** - Server backfill infrastructure
  - New `um_every_minute` cron interval (60 seconds)
  - `um_cron_server_backfill` action hook
  - Auto-stops when `state.done = true`
  - Control functions:
    - `um_start_server_backfill()` - Enable + schedule
    - `um_stop_server_backfill()` - Disable + unschedule
    - `um_is_server_backfill_active()` - Check status
    - `um_get_server_backfill_status()` - Get details

- **`includes/admin-endpoints.php`** - Admin UI section
  - New "Server-Side Backfill" card
  - 🚀 Start button (green, hero size)
  - ⏸ Stop button (when active)
  - Live status display:
    - Started timestamp
    - Last run timestamp
    - Next scheduled run
  - Tips box with recommended settings
  - Page auto-refreshes every 10 seconds when active
  - Admin handlers for start/stop actions

**State Management:**
```php
um_server_backfill_active     // Boolean flag
um_server_backfill_started    // Start timestamp
um_server_backfill_last_run   // Last execution
um_server_backfill_completed  // Completion timestamp
```

**How It Works:**
1. User clicks "Start Server Backfill"
2. WordPress schedules cron (every 60 seconds)
3. Each run processes one batch (respects mode + settings)
4. State persists, progress saved
5. Auto-stops when complete
6. User can close browser - runs in background!

**Recommended Settings for Fast Completion:**
- Backfill Mode: Single Article
- Backfill Pages Per Run: 25-50
- Expected time: 30-60 minutes for 2,000+ articles

**Benefits:**
- No need to keep admin page open
- Runs fully in background via WordPress cron
- Auto-stops when complete
- Works with both batch and single-article modes
- Visual progress monitoring (optional)

**Status:** ✅ Both features fully implemented and ready for testing

---

### ✅ Completed 2025-12-29: Binary Search for Corrupt Articles

#### Problem Discovery
- Diplomatic Watch hitting HTTP 500 errors around page 28 (~2,700 articles)
- Initial diagnosis: thought deep pagination was causing issues
- **Root cause:** Corrupt individual articles (not pagination depth)
- Old solution: Skip entire page (100 articles) = 4.5% data loss

#### Binary Search Solution Implemented
**Algorithm:** Automatically identifies exact corrupt articles via binary search (O(log n))

**Process:**
1. Page fails → retry 3 times
2. After 3 failures → activate binary search
3. Halve window size: 100→50→25→12→6→3→2→1
4. Test each window until `per_page=1` identifies exact corrupt article
5. Skip only that article, resume with full page size
6. Continue backfill automatically

**Implementation:**
- **`includes/backfill.php`** (lines 17-165):
  - `um_handle_fetch_error()` - Core binary search logic
  - State management for search progress
  - Offset calculation for absolute positioning
- **`includes/http.php`** (lines 109-127):
  - Added offset parameter support to `um_fetch_posts_page()`
  - Enables `?offset=2725&per_page=50` queries
- **`includes/admin-endpoints.php`**:
  - PHP: Binary search status display (lines 92-116)
  - JavaScript: Live progress updates (lines 454-473)

**State Variables Added:**
```php
'binary_search_active'    // Tracks if search in progress
'binary_search_page'      // Original page that failed
'binary_search_offset'    // Current offset within page
'binary_search_per_page'  // Current search window size
'binary_search_imported'  // Articles imported during search
'skipped_articles'        // Log of corrupt articles
```

**Benefits:**
- **100× data loss reduction:** 0.04% (1 article) instead of 4.5% (100 articles)
- **Automatic recovery:** No manual intervention needed
- **Transparent:** Admin UI shows search progress in real-time
- **Efficient:** Maximum 7 iterations per corrupt article (log₂(100))
- **Audit trail:** All skipped articles logged with metadata

**Admin UI Indicators:**
- 🔍 Yellow banner: "Binary Search Active"
- Real-time: Window size, offset, iteration count
- Counter: Total skipped corrupt articles
- Live updates during continuous run mode

**Status:** ✅ Fully implemented and ready for testing

**Post-Implementation Bug Fixes (2025-12-30):**

1. **Site Transition Bug:** Binary search state wasn't resetting between sites
   - **Issue:** Second site always skipped (state contamination)
   - **Fix:** Reset binary search state AND reload local `$page` variable when transitioning sites
   - **Files:** `includes/backfill.php` lines 301, 461

2. **Page Counter Inflation Bug:** Page counter incremented during binary search
   - **Issue:** Page displayed as 85 when actually on page 9
   - **Root Cause:** Every successful binary search fetch incremented page counter
   - **Fix:** Only increment page when NOT in binary search mode; advance offset instead
   - **Files:** `includes/backfill.php` lines 516-540

3. **Duplicate Article Processing:** Binary search re-fetching same articles
   - **Issue:** Showing 796 "new" + 100 "updated" when only 100 truly imported
   - **Root Cause:** `per_page` reset to 100 at loop start, ignoring binary search offset
   - **Fix:** Calculate `per_page` based on remaining articles in page during binary search
   - **Files:** `includes/backfill.php` lines 235-243

4. **Enhanced Admin UI (2025-12-30):**
   - **Detailed metrics display:**
     - Time elapsed (live timer)
     - Last batch article count
     - Separate counters for inserted/updated/skipped/failed
   - **JSON Response Viewer:**
     - Shows full API response from each batch
     - Scrollable 400px height
     - Updates after each batch completes
     - Useful for debugging state issues
   - **Files:** `includes/admin-endpoints.php` lines 150-176, 288-300, 313-368, 462-480

**Current Status:** ✅ All bugs fixed, enhanced monitoring in place

**Known Limitation:** Some corrupt articles may still cause persistent failures. Decision: Accept minimal data loss (~0.04%) rather than infinite retry loops.

---

### ✅ Completed 2025-12-30: Field Extraction & Frontend Component

#### Problem
- Articles stored but missing fields needed for frontend display
- Required: featured images, author names, categories, full content for search
- Need frontend component to test data display

#### Field Extraction Implementation

**1. Featured Images (storage.php:183-187)**
```php
// Extract featured image from _embed
$featured_image = '';
if (!empty($remote_post['_embedded']['wp:featuredmedia'][0]['source_url'])) {
    $featured_image = esc_url_raw($remote_post['_embedded']['wp:featuredmedia'][0]['source_url']);
}
```
- Stored as `um_featured_image_url` post meta
- Fallback: Gray placeholder rendered in frontend

**2. Author Names (storage.php:189-199)**
```php
$author_name = 'Not Credited'; // Default fallback

// Try custom authors plugin first (multi-author support)
if (!empty($remote_post['authors'][0]['display_name'])) {
    $author_name = sanitize_text_field($remote_post['authors'][0]['display_name']);
}
// Fallback to standard WP author
else if (!empty($remote_post['_embedded']['author'][0]['name'])) {
    $author_name = sanitize_text_field($remote_post['_embedded']['author'][0]['name']);
}
```
- Stored as `um_author_name` post meta
- Supports both custom authors plugin and standard WP authors

**3. Category System (Complete Implementation)**

**3a. Taxonomy Registration (storage.php:34-47)**
- Registered `um_category` hierarchical taxonomy
- `public => false` (internal only)
- `show_in_rest => true` (enables REST API filtering)
- `show_admin_column => true` (displays in articles list)

**3b. Activation Hook (united-media-ingestor.php:29-91)**
- `um_activate_plugin()` creates all 43 category terms on activation
- 8 parent categories (unified buckets)
- 35 child categories (specific topics)
- Uses mapping definitions from `includes/mapping.php`

**3c. Category Extraction (normalize.php:16-40)**
- `um_extract_remote_categories()` extracts from `_embedded['wp:term']`
- Filters for `taxonomy === 'category'` (ignores tags)
- Returns array of category names

**3d. Category Assignment (storage.php:256-278)**
- Calls `um_resolve_categories()` to map remote → unified categories
- Assigns via `wp_set_object_terms()`
- Marks excluded articles with `um_is_excluded = 1`
- Tracks unmapped categories for admin review

**3e. Parent Category Display (rest-api.php:133-145)**
- Detects parent category for each article
- Returns parent name (unified bucket) in API response
- Used for card display: "World News & Politics" instead of "Diplomatic Watch: Africa"

**4. Full Content Storage (storage.php:170-181, 246-253)**
```php
// Strip HTML, shortcodes, normalize whitespace
$plaintext = wp_strip_all_tags(strip_shortcodes($html));
$plaintext = html_entity_decode($plaintext, ENT_QUOTES | ENT_HTML5, 'UTF-8');
$plaintext = preg_replace('/\s+/', ' ', $plaintext);
$plaintext = trim($plaintext);

// Store for search
update_post_meta($post_id, 'um_plaintext', $plaintext);

// Calculate word count
$word_count = str_word_count($plaintext);
update_post_meta($post_id, 'um_word_count', $word_count);
```
- Stored as `um_plaintext` post meta
- Available via REST API with `?include_content=1` parameter
- Ready for enhanced full-text search implementation

**5. Read Time Calculation (rest-api.php:153-158)**
```php
// Calculate read time (200 words per minute)
$word_count = (int)get_post_meta($p->ID, 'um_word_count', true);
$read_time_minutes = 0;
if ($word_count > 0) {
    $read_time_minutes = max(1, ceil($word_count / 200));
}
```
- Industry standard: 200 words per minute
- Minimum 1 minute (prevents "0 min read")
- Displayed as "5 min read" in frontend

**6. REST API Response (rest-api.php:160-179)**
```php
$item = array(
    'id'              => $p->ID,
    'title'           => get_the_title($p),
    'date'            => get_post_meta($p->ID, 'um_date_gmt', true),
    'source'          => get_post_meta($p->ID, UMI_SOURCE_SITE_META_KEY, true),
    'source_label'    => get_post_meta($p->ID, 'um_source_label', true),
    'source_url'      => get_post_meta($p->ID, UMI_SOURCE_URL_META_KEY, true),
    'excerpt'         => wp_trim_words($p->post_content, 30),
    'featured_image'  => get_post_meta($p->ID, 'um_featured_image_url', true),
    'author_name'     => get_post_meta($p->ID, 'um_author_name', true),
    'category'        => $parent_category,            // Unified bucket name
    'categories'      => $categories,                 // Full array
    'read_time_minutes' => $read_time_minutes,
    'is_excluded'     => (bool)get_post_meta($p->ID, UMI_EXCLUDED_META_KEY, true),
);

// Optionally include full content (expensive)
if ($include_content) {
    $item['content'] = get_post_meta($p->ID, 'um_plaintext', true);
}
```

#### Frontend Component (divi-feed-component.html)

**Complete standalone component for Divi Code Module:**
- Self-contained HTML + CSS + JavaScript
- Fetches from `/wp-json/um/v1/articles`
- Skeleton loaders during fetch
- Hero card layout (first article, larger)
- Secondary grid layout (remaining articles, 3 columns)
- Load more pagination
- Automatically displays all extracted fields:
  - Featured images (with placeholder fallback)
  - Author names
  - Category badges (parent categories)
  - Read time ("5 min read")
  - Publication dates
  - Links to original articles

**Files Modified:**
- `includes/storage.php` - Field extraction + category assignment
- `includes/normalize.php` - Category extraction helper
- `includes/rest-api.php` - Category + read time in response
- `united-media-ingestor.php` - Activation hook for category terms
- `divi-feed-component.html` - Complete frontend component (NEW)

**Status:** ✅ All fields extracted and stored, frontend component ready for testing

**Next Steps:**
1. Deactivate/reactivate plugin to create category terms
2. Delete articles and reset state
3. Run continuous backfill to populate new fields
4. Test Divi component with real data

---

### ✅ Completed 2026-01-03: Production-Ready Category Section Component

#### Problem
- Initial `divi-feed-component.html` was a generic feed (all articles in one big list)
- Need individual category sections for the 8 parent categories
- Each section should display 2 featured + 6 regular articles from that category
- Design requirements from reference image:
  - Featured: Full-width image with gradient overlay, title on image, source badge, author/read time
  - Regular: Horizontal layout with rounded thumbnail on left, source/title/read time on right
  - Responsive: Two columns on desktop, stack featured articles first on mobile

#### Implementation: `divi-category-section.html`

**Component Architecture:**
- **Reusable component** - Single file used 8 times (one per category)
- **Data-driven** - Category specified via `data-category` attribute
- **Multi-instance support** - Multiple components work independently on same page
- **Automatic initialization** - Finds and initializes all instances via class selector

**Layout Structure:**
```
Category Title
├─ Column 1 (Featured 1 + Regular 1,2,3)
└─ Column 2 (Featured 2 + Regular 4,5,6)
```

**Featured Card Design:**
- 400px height, full-width image
- Dark gradient overlay (60% height from bottom)
- Content positioned over gradient:
  - Source badge (blue pill, top)
  - Article title (large white text)
  - Author + read time with clock icon

**Regular Card Design:**
- Horizontal layout (140px × 140px thumbnail + text)
- Rounded corners (8px border-radius)
- Source name (top, small caps, blue)
- Title (3-line clamp with ellipsis)
- Read time with clock icon (bottom)

**Responsive Behavior:**
- Desktop (≥768px): Two columns side-by-side
- Mobile (<768px): Single column with CSS flexbox `order` reordering:
  1. Featured 1
  2. Featured 2
  3. Regular 1-6
- Uses `display: contents` to flatten column wrappers on mobile

**Key Features:**
- Fetches 8 most recent articles per category via REST API
- Ordered by original publish date (`um_date_gmt`), not ingestion date
- Loading skeletons during fetch
- Empty/error state handling
- Clock emoji (🕐) before read times
- Each instance maintains independent state
- Duplicate initialization protection

**Files Created/Modified:**
- **`divi-category-section.html`** (NEW) - Complete reusable component
- **`includes/rest-api.php`** - Fixed ordering to use `meta_value` on `um_date_gmt` instead of `post_date`

**Usage in Divi:**
```html
<!-- World News & Politics -->
<div class="um-category-section-container" data-category="world-news-politics"></div>

<!-- Profiles & Opinions -->
<div class="um-category-section-container" data-category="profiles-opinions"></div>

<!-- ... 6 more categories ... -->
```

**Status:** ✅ Complete and production-ready

**Implementation Details:**
- Articles ordered by source publish date, not database insertion date
- Responsive stacking ensures featured articles appear first on all devices
- Component handles multiple instances without ID conflicts
- Clean separation between featured and regular card styles
- Optimized for Divi Code Module deployment

---

### ✅ Completed 2025-12-27 Session

#### 1. Cursor-Based Backfill (Critical Fix)
- **Issue:** Diplomatic Watch HTTP 500 errors at page 31+
- **Solution:** Implemented `before_cursor` backfill mode using WP REST `?before=` parameter
- **Files Modified:**
  - `includes/http.php` - Added `um_fetch_posts_before()`
  - `includes/backfill.php` - Added mode detection and cursor advancement logic
- **Status:** ✅ Working - no more HTTP 500s on large archives

#### 2. Admin Control Panel
- **Location:** UM Articles → Ingestor Control
- **Features:**
  - Live status dashboard (local vs remote counts)
  - Visual site progress indicators
  - One-click backfill/incremental runs
  - Auto-run toggle
  - Settings management (per_page, timeout, pages_per_run)
  - Danger Zone (delete all + reset)
- **Files Modified:**
  - `includes/admin-endpoints.php` - Complete admin UI overhaul
- **Status:** ✅ Fully functional

#### 3. Continuous Run Mode
- **Feature:** Automated batch processing with live progress
- **Behavior:**
  - Runs batches continuously until complete or error
  - Shows real-time progress (batches run, articles imported)
  - Auto-stops on completion or error
  - Stoppable by user
- **Files Modified:**
  - `includes/admin-endpoints.php` - AJAX handler + JavaScript
- **Status:** ✅ Working

#### 4. Site Priority Reordering
- **Change:** Smaller sites import first
- **New Order:**
  1. Echo Media (~13 articles)
  2. International Spectrum (~33 articles)
  3. Diplomatic Watch (~2,170 articles)
- **Rationale:** Quick wins, early testing data
- **Files Modified:**
  - `includes/config.php`
- **Status:** ✅ Applied

#### 5. HTTP 400 Error Handling
- **Issue:** Page-based backfill treating "no more pages" as fatal error
- **Solution:** Detect HTTP 400/404 and auto-advance to next site
- **Files Modified:**
  - `includes/backfill.php`
- **Status:** ✅ Fixed

#### 6. Source Column in Articles List
- **Feature:** Color-coded source badges + "View Original" links
- **Colors:**
  - 🟠 Echo Media (orange)
  - 🟢 International Spectrum (green)
  - 🔵 Diplomatic Watch (blue)
- **Files Modified:**
  - `includes/admin-endpoints.php`
- **Status:** ✅ Working

#### 7. Configurable Settings
- **Settings Now Editable:**
  - Posts per page (1-100)
  - HTTP timeout (10-300s)
  - Backfill pages per run (1-10)
- **Storage:** WordPress options table
- **Files Modified:**
  - `includes/config.php` - Constants now check options first
  - `includes/admin-endpoints.php` - Settings form
- **Status:** ✅ Working

---

## Critical Path (From CLAUDE.md - Not Yet Implemented)

### 🔴 Priority 1: Taxonomy Registration + Activation Routine
**Status:** ❌ Not implemented
**Blocker:** Without this, category filtering is broken
**Requirements:**
- Register `um_category` taxonomy (hierarchical, non-public, REST-enabled)
- Create activation hook to auto-create all terms from `mapping.php`
- Parent terms: "World News & Politics", "Economy & Business", etc.
- Child terms: "Diplomatic Watch: Africa", "Echo Media: Art & Culture", etc.

**Files to Modify:**
- `includes/storage.php` - Add `register_taxonomy()` call
- `united-media-ingestor.php` - Add activation hook

**Estimated Effort:** 1-2 hours

---

### 🔴 Priority 2: Category Extraction + Assignment
**Status:** ❌ Not implemented
**Blocker:** Articles have no categories, can't filter by topic
**Requirements:**
- Extract categories from `$remote_post['_embedded']['wp:term']`
- Map via `um_resolve_categories()` (already exists in `mapping.php`)
- Assign terms via `wp_set_object_terms()`
- Handle excluded categories (set `um_is_excluded = 1`)
- Track unmapped categories for review

**Files to Modify:**
- `includes/normalize.php` - Add `um_extract_remote_categories()`
- `includes/storage.php` - Integrate extraction + mapping + assignment

**Estimated Effort:** 2-3 hours

---

### 🟡 Priority 3: Unmapped Category Tracking
**Status:** ❌ Not implemented
**Requirement:** Surface unmapped categories in admin UI
**Implementation:**
- Store in option: `um_unmapped_categories`
- Format: `{site_id}|{slug} => {count, last_seen}`
- Add admin panel showing all unmapped entries

**Files to Modify:**
- `includes/storage.php` - Track unmapped
- `includes/admin-endpoints.php` - Display panel

**Estimated Effort:** 1 hour

---

### 🟢 Priority 4: Error Logging
**Status:** ⚠️ Partially implemented
**Current:** Last error stored in backfill state, shown in admin
**Needed:** Rolling log of recent errors (last 100)
**Implementation:**
- Option: `um_recent_errors` (array, max 100 entries)
- Format: `{timestamp, site_id, operation, error_message}`
- Admin section: "Recent Errors" (last 20 with "View All" link)

**Files to Modify:**
- `includes/backfill.php` - Log errors to option
- `includes/incremental.php` - Log errors to option
- `includes/admin-endpoints.php` - Display errors panel

**Estimated Effort:** 1-2 hours

---

## V2 Features (Future)

### Full-Text Content Storage
**Decision:** Currently storing excerpt only
**Current Storage:**
- `post_title` - Full title ✅
- `post_content` - Excerpt only (~30-100 words) ✅
- `um_source_url` - Link to original ✅

**V2 Plan:**
- Add `um_plaintext` meta field with full content (stripped HTML/shortcodes)
- Enable full-text search across title + excerpt + plaintext
- Consider indexing strategy if performance degrades

**Estimated Database Impact:**
- 2,216 articles × ~2-5KB each = ~10-20MB additional storage

---

### Enhanced Search
**Current:** Basic WP search (title + excerpt)
**Limitations:**
- Doesn't search category names
- No relevance ranking
- Limited to excerpt content

**V2 Options:**
- Custom search logic to include category names
- Relevance ranking (not in default WP_Query)
- External search service (Algolia, Elasticsearch) if needed

---

### SSL Verification Hardening
**Current:** `UMI_SSL_VERIFY = false` (dev-only)
**Production Plan:**
- Verify remote site SSL certificates
- Enable `UMI_SSL_VERIFY = true`
- Add admin warning if running with `false` in production
- Support override via `wp-config.php`

---

## Known Issues / Tech Debt

### 1. Lock Mechanism
**Current:** Transient-based lock with 180s TTL
**Issue:** If process crashes, lock remains until TTL expires
**Mitigation:** Manual clear via: `wp transient delete um_ingest_lock_v1`
**Future:** Add "Force Unlock" button to admin

---

### 2. Normalize.php Empty
**Current:** File exists but is empty (0 lines)
**Decision Log Says:** Should contain extraction/normalization helpers
**Needed Functions:**
- `um_extract_remote_categories()` - Extract from `_embed`
- `um_normalize_title()` - Strip tags, decode entities
- `um_normalize_excerpt()` - Strip tags, trim
- `um_normalize_date_gmt()` - Best ISO8601 GMT string

---

### 3. No Cron Status in Admin
**Gap:** Can't see if cron jobs are scheduled/running
**Would Be Nice:**
- Show next scheduled run times
- Show cron event history
- Manual cron trigger button

---

## Testing Checklist

### Before Production Deploy
- [ ] Verify SSL certificates on all remote sites
- [ ] Enable `UMI_SSL_VERIFY = true`
- [ ] Test full import cycle (delete all + continuous run)
- [ ] Verify category assignment working
- [ ] Test REST API filtering by category
- [ ] Test search functionality
- [ ] Load test with actual traffic
- [ ] Verify no memory leaks during long runs
- [ ] Test cron jobs run successfully
- [ ] Backup database before first production run

---

## Performance Targets

### Import Speed
**Current:**
- Manual single batch: ~2-3 seconds per batch (25 articles)
- Continuous run: ~22 minutes for 2,216 articles
- Automatic (cron): ~22 hours for full archive

**Optimized:**
- Increase `pages_per_run` to 3-5: ~8-12 minutes for full archive
- Increase `per_page` to 50: ~5-8 minutes for full archive

**Limits:**
- Remote site rate limiting unknown
- PHP max_execution_time: 60s (Local default)
- WordPress timeout: 60s

---

## Database Schema (Current)

### Post Type: `um_article`
- `post_title` - Article title
- `post_content` - Excerpt (text preview)
- `post_status` - Always 'publish'
- `post_type` - Always 'um_article'
- `post_date` - Local date

### Post Meta
- `um_source_site` - Site ID (echo-media, internationalspectrum, diplomaticwatch)
- `um_remote_post_id` - Original post ID on remote site
- `um_source_url` - URL to original article
- `um_source_label` - Human-readable site name
- `um_date_gmt` - GMT timestamp
- `um_date_local` - Local timezone timestamp
- `um_raw_min` - JSON of minimal raw data
- `um_is_excluded` - 1 if excluded category (not yet implemented)

### Taxonomy: `um_category` (NOT YET REGISTERED)
- Parent terms: 8 top-level categories
- Child terms: 35+ specific categories
- Hierarchical: true
- Public: false
- Show in REST: true

---

## Development Workflow

### Making Changes
1. Edit files in: `/Users/huuho/Downloads/allison/united-media-ingestor/`
2. WordPress reads from symlink: `/Users/huuho/Local Sites/.../plugins/united-media-ingestor`
3. Changes take effect immediately (no need to copy files)

### Testing Changes
1. Visit Control Panel: `http://united-media-group-alpha.local/wp-admin/edit.php?post_type=um_article&page=um-ingestor-control`
2. Click "Delete All Articles & Reset State" (if needed)
3. Click "Run Continuous" to test full flow
4. Monitor for errors in status table

### Git Workflow
- Working directory: `/Users/huuho/Downloads/allison/united-media-ingestor/`
- Branch: `main`
- Remote: (not yet configured in transcript)

---

## Next Session Goals

1. **Implement taxonomy registration** (Priority 1)
2. **Implement category extraction + assignment** (Priority 2)
3. **Test full import with categories**
4. **Verify REST API category filtering works**
5. **Add unmapped category tracking** (Priority 3)

---

## Questions to Resolve

1. **Full content storage:** Do we want to store full article text? (See §7 in CLAUDE.md)
2. **Featured images:** Should we store/display featured images from remote posts?
3. **Author info:** Should we store author names/IDs?
4. **Tags:** Should we import and map tags in addition to categories?
5. **Rate limiting:** Are there rate limits on the remote sites we should respect?
6. **Pagination limits:** What's the max page number each site can handle reliably?

---

## Reference Links

- Control Panel: `http://united-media-group-alpha.local/wp-admin/edit.php?post_type=um_article&page=um-ingestor-control`
- Articles List: `http://united-media-group-alpha.local/wp-admin/edit.php?post_type=um_article`
- REST API: `http://united-media-group-alpha.local/wp-json/um/v1/articles`
- Status Endpoint: `http://united-media-group-alpha.local/wp-admin/admin-post.php?action=um_status`
