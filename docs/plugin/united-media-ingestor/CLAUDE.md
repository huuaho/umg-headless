# United Media Ingestor — CLAUDE.md

Last updated: 2026-01-05 (Full-Text Search Implementation)

## What this project is

**United Media Ingestor** is a WordPress plugin that **aggregates posts from multiple external WordPress sites**
into a **local, non-public storage layer** so we can:

- Build a fast homepage feed (no client-side cross-site fetches)
- Build full-text search across all ingested articles ✅
- Keep a unified category system that maps each source site's categories into our spec
- Always **redirect readers to the original source article** (we are not trying to publish duplicates)

This repo intentionally favors **clarity and operability** over cleverness.

## Intentions and goals

1. **Server-side aggregation**
   - Visitors should hit only our WordPress site.
   - Our site fetches remote content in the background (cron/manual backfill).

2. **Search-ready local database**
   - Store enough metadata and (optionally) text to support:
     - fast sorting/filtering
     - full-text search
     - analytics on what we have ingested

3. **No navigable duplicate pages**
   - Ingested items are stored as a **private CPT**.
   - The plugin provides a REST API that returns normalized “cards”.
   - Clicking a card goes to the **remote source URL**.

4. **Deterministic category mapping**
   - Remote categories are mapped into our unified categories.
   - Some source categories are “excluded” from display (per spec).
   - We may still ingest excluded categories for parity, but hide them at render-time.

## High-level architecture

Remote sites (WP REST API) → HTTP client → normalize/map → local storage → our REST feed/search → Divi rendering

### Module map

- `united-media-ingestor.php`
  - Bootstrap: constants + includes.

- `includes/config.php`
  - Source site definitions
  - HTTP timeout/SSL flags (dev-only if certs are broken)
  - Batch sizing constants
  - Canonical meta-key names

- `includes/http.php`
  - URL builders for WP REST endpoints
  - Resilient GET with retries/backoff (3 attempts by default)
  - Header normalization (`x-wp-total`, `x-wp-totalpages`)
  - Fetch helpers:
    - page-based: `?page=N` (with optional offset support for binary search)
    - cursor-based: `?before=ISO8601` / `?after=ISO8601`
    - offset-based: `?offset=N&per_page=M` (for binary search within pages)
    - single-article: `um_fetch_single_article()` - always `per_page=1`

- `includes/mapping.php`
  - Category mapping rules & exclusions
  - Source-category → unified-category conversion helpers

- `includes/storage.php`
  - Registers CPT `um_article` (non-public)
  - Upsert logic keyed by `{source_site, remote_post_id}` (and/or source URL)
  - Stores normalized fields used by feed/search

- `includes/backfill.php`
  - Historical ingestion runner
  - Resume-safe state stored in `wp_options`
  - Two modes: batch (with binary search) and single-article
  - Binary search algorithm for corrupt article detection (batch mode)
  - Single-article mode: one API call per article, skip after 3 retries
  - Admin-post endpoints to run/reset

- `includes/incremental.php`
  - Incremental ingestion runner
  - Maintains per-site cursor timestamps
  - Designed to run on cron

- `includes/cron.php`
  - Schedules + dispatch for incremental/backfill tasks
  - Server-side backfill: aggressive 1-minute cron for fast completion
  - Auto-stops when backfill completes

- `includes/admin-endpoints.php`
  - Admin UI (“UM Articles”)
  - Buttons/actions for totals, backfill run, continuous run, reset, delete-all

- `includes/rest-api.php`
  - Public REST endpoints consumed by the frontend:
    - feed endpoint
    - search parameter support

- `includes/normalize.php`
  - Category extraction from remote `_embed` data
  - Text/date normalization helpers
  - Pure functions for consistent data transformation

- `includes/search.php`
  - Full-text search functionality
  - Template interception for WordPress search queries
  - Custom search filters for title, excerpt, and plaintext content
  - Helper functions for search result display
  - Stylesheet enqueuing

- `templates/search-results.php`
  - Custom search results page template
  - Server-side rendering with WordPress integration
  - Article card display matching design spec
  - Pagination support

- `assets/search-results.css`
  - Search results page styling
  - Responsive design for all screen sizes
  - Typography and layout matching design reference

## Decision log (implementation requirements)

This section encodes definitive product decisions. Follow these exactly when implementing features.

### 1. Taxonomy registration (`um_category`)

**Decision:** Register `um_category` as a custom hierarchical taxonomy attached to `um_article`.

**Requirements:**
- `register_taxonomy('um_category', array('um_article'), [...])`
- `hierarchical => true` (parent categories: "World News & Politics", children: "Diplomatic Watch: Africa", etc.)
- `show_in_rest => true` (for REST API category filtering)
- `public => false` (internal indexing only, no public term pages)
- `show_ui => true` (allow admin inspection)
- `rewrite => false` (no public URLs)

**Activation routine:**
- On plugin activation, auto-create all terms from `um_category_parents()` and `um_category_children_spec()`
- Use stable slugs as defined in `mapping.php`
- Create parent terms first, then children with correct `parent` assignment
- Store term relationships using term IDs for stability

### 2. Category assignment during ingestion

**Decision:** `storage.php::um_upsert_article()` MUST extract, map, and assign categories for every ingested post.

**Implementation flow:**
1. Extract remote categories from `$remote_post['_embedded']['wp:term']` (see §3)
2. Pass category names to `um_resolve_categories($site_id, $category_names)`
3. Get back: `mapped_slugs`, `unmapped`, `is_excluded`, `excluded_reason`
4. Assign mapped categories via `wp_set_object_terms($post_id, $mapped_slugs, 'um_category', false)`
5. If `is_excluded === true`: set meta `um_is_excluded = 1` and store `excluded_reason`
6. Track unmapped categories (see §2a)

**2a. Unmapped category tracking**

**Decision:** Do NOT silently ignore unmapped categories. Log and surface them for review.

**Implementation:**
- Maintain option `um_unmapped_categories` as: `{site_id}|{remote_category_slug} => {count, last_seen}`
- Increment count each time an unmapped category is encountered
- Add admin UI panel: "Unmapped Categories" showing all tracked entries
- Allows humans to update `mapping.php` as new categories appear on remote sites

**2b. Posts with only excluded categories**

**Decision:** Ingest but mark as excluded. Keep the row for parity/auditing.

**Implementation:**
- Store post with `um_is_excluded = 1`
- REST API excludes these by default
- REST API supports `include_excluded=1` query param for debugging
- This maintains correct archive counts without polluting the UI

### 3. Category extraction from remote posts

**Decision:** Extract categories from `_embed` data deterministically.

**Location in remote JSON:**
- Primary: `$remote_post['_embedded']['wp:term'][0]` (array where `taxonomy === 'category'`)
- Fallback: Not needed if `_embed=1` is always used (which it is)

**Implementation:**
- Add helper: `um_extract_remote_categories($remote_post)` in `normalize.php`
- Returns normalized array: `[{id, slug, name}, ...]`
- Filter for `taxonomy === 'category'` (ignore tags, custom taxonomies)
- Return only the `name` field (used for mapping)

### 4. SSL verification

**Decision:** `UMI_SSL_VERIFY = false` is temporary/dev-only.

**Requirements:**
- Keep `false` for local/staging if needed
- Set `true` for production environments
- Add constant override capability via `wp-config.php`:
  ```php
  define('UMI_SSL_VERIFY_OVERRIDE', true);
  ```
- Document: accepting `false` in production is a MITM risk

**Action items:**
- Verify remote site SSL certificates are valid
- Flip to `true` once confirmed
- Add admin warning if running with `false` in production

### 5. Cursor-based backfill implementation

**Decision:** Implement `before_cursor` backfill mode to fix HTTP 500s on deep pagination.

**Why:** Sites like Diplomatic Watch with large archives fail at `?page=31+`. Cursor mode avoids this.

**Implementation:**
- Add `um_fetch_posts_before($base, $before_iso, $per_page)` to `http.php`
- Uses WP REST params: `before=ISO8601&orderby=date&order=desc`
- Backfill logic in `backfill.php`:
  - If `backfill_mode === 'before_cursor'`:
    - Start with `before = now()`
    - Fetch batch
    - Update cursor to oldest `date_gmt` in batch
    - Repeat until no posts returned
  - If `backfill_mode === 'page'`:
    - Use existing page-based logic

**Cursor state storage:**
- Store per-site: `um_backfill_cursor_{site_id} => ISO8601`
- Reset on backfill reset

### 6. normalize.php purpose

**Decision:** `normalize.php` is NOT empty. It contains pure extraction/normalization helpers.

**Required functions:**
- `um_extract_remote_categories($remote_post)` — extract categories from `_embed`
- `um_normalize_title($raw_title)` — strip tags, decode entities
- `um_normalize_excerpt($raw_excerpt)` — strip tags, decode entities, trim
- `um_normalize_date_gmt($remote_post)` — return best ISO8601 GMT string
- (Future) `um_extract_featured_image($remote_post)` — get thumbnail from `_embed`

**Philosophy:** Keep these pure (input → output, no side effects). Storage calls these.

### 7. Content storage strategy

**Decision:** Store excerpts for v1. Plan full-text storage for v2.

**V1 (implemented):**
- Store `post_title` (full) ✅
- Store `post_content` = excerpt (stripped, ~30 words) ✅
- WP search queries title + excerpt ✅

**V2 (implemented 2025-12-30):**
- ✅ Added meta `um_plaintext` = full content stripped of HTML/shortcodes
- ✅ Added meta `um_word_count` = word count for read time calculation
- ✅ REST API includes optional `include_content=1` parameter
- Search across title + excerpt + plaintext (ready for implementation)
- Consider indexing strategy (plugin or external service) if performance degrades

**Status:** Full-text content now stored and available for enhanced search.

### 8. REST API search scope

**Decision:** Basic WP search is fine for v1. Enhance later if needed.

**Current behavior:**
- `?search=keyword` queries `post_title` and `post_content` (excerpt)
- Does NOT search taxonomy terms (category names)

**Future enhancement (v2):**
- Add custom search logic to include category names in results
- Consider relevance ranking (not provided by default WP_Query search)
- Evaluate external search service (Algolia, Elasticsearch) if internal search is insufficient

**Action items for v1:**
- Document search scope in REST API comments
- Ensure category filtering works (`?category=slug`)
- Test search quality with real data before deciding on enhancements

### 9. Error logging

**Decision:** Persist errors for visibility and debugging.

**Minimum viable logging (v1):**
- Keep last error per site in backfill/incremental state (already done)
- Add rolling log: option `um_recent_errors` (array, max 100 entries)
- Each entry: `{timestamp, site_id, operation, error_message}`
- Admin page section: "Recent Errors" (shows last 20, with "View All" link)

**Future (v2):**
- Custom DB table if error volume justifies it
- Email/Slack notifications for critical failures (e.g., 3+ consecutive failures for a site)

**Guidance:** Start simple. Option-based log is sufficient unless you're seeing high error rates.

### 10. Cursor-based backfill HTTP helpers

**Decision:** Implement `um_fetch_posts_before()` to support `before_cursor` backfill mode.

**Implementation in `http.php`:**
```php
function um_fetch_posts_before($base, $before_iso, $per_page = 25) {
    $params = array(
        'per_page' => min(100, max(1, intval($per_page))),
        'orderby'  => 'date',
        'order'    => 'desc',
        '_embed'   => 1,
    );
    if ($before_iso) {
        $params['before'] = $before_iso;
    }
    $url = um_build_posts_url($base, $params);
    return um_http_get($url);
}
```

**Usage:** Called by `backfill.php` when site config specifies `backfill_mode => 'before_cursor'`.

### 11. Binary search for corrupt articles

**Decision:** When a page fails with HTTP 500, use binary search to identify and skip ONLY the corrupt article, not the entire page.

**Problem:**
- Remote sites occasionally have corrupt articles that cause HTTP 500 errors
- Skipping entire pages (100 articles) causes ~4.5% data loss
- Need to minimize data loss while maintaining resilience

**Solution: Binary Search Algorithm**

When a page fails after 3 retries:
1. Halve the page size: 100→50→25→12→6→3→2→1
2. If smaller window succeeds → import articles, move to next segment
3. If smaller window fails → halve again
4. When `per_page=1` fails → exact corrupt article identified
5. Skip only that article, resume with full page size

**Implementation files:**
- `includes/backfill.php` — `um_handle_fetch_error()` function + state management
- `includes/http.php` — `um_fetch_posts_page()` with offset parameter support
- `includes/admin-endpoints.php` — UI progress display for binary search

**State variables:**
```php
'binary_search_active' => false,     // Is binary search in progress?
'binary_search_page' => null,        // Original page that failed
'binary_search_offset' => 0,         // Current offset within page
'binary_search_per_page' => 100,     // Current search window size
'binary_search_imported' => 0,       // Articles imported during search
'skipped_articles' => array(),       // Log of individually skipped articles
```

**HTTP offset support:**
- Normal: `?page=28&per_page=100`
- Binary search: `?offset=2725&per_page=50`
- Allows fetching arbitrary article ranges within a page

**Benefits:**
- Data loss: 0.04% instead of 4.5% (100× improvement)
- Automatically recovers from corrupt articles
- Transparent to user (shows progress in admin UI)
- Maximum ~7 iterations per corrupt article (log₂(100))

**Admin UI indicators:**
- Yellow banner shows "🔍 Binary Search Active"
- Displays window size, offset, iteration count
- Live updates during continuous run
- Shows total count of skipped corrupt articles

**Logging:**
Each skipped article is logged with:
- Site ID
- Page number
- Offset within page
- Reason (HTTP 500 error)
- Timestamp

---

### 12. Single-Article Mode

**Decision:** Add a simpler backfill mode that fetches one article at a time as an alternative to batch mode with binary search.

**Why:** Provide a straightforward, easy-to-understand fallback when binary search complexity is not needed or when maximum reliability is required.

**Implementation:**

**Mode Selection (config.php):**
```php
define('UMI_BACKFILL_MODE', get_option('um_backfill_mode', 'batch'));
// Options: 'batch' (default) or 'single'
```

**Single Article Fetch (http.php):**
```php
function um_fetch_single_article($base, $offset) {
    $params = array(
        'per_page' => 1,  // Always 1
        'offset'   => max(0, intval($offset)),
        'orderby'  => 'date',
        'order'    => 'desc',
        '_embed'   => 1,
    );
    // Automatically retries 3 times via um_http_get()
}
```

**Backfill Runner (backfill.php):**
- New function: `um_run_backfill_single_article()`
- Fetches one article per API call
- On failure after 3 retries: logs error, skips article, continues
- Uses offset instead of page numbers for tracking
- Simpler state: no binary search variables needed

**Mode Routing:**
```php
function um_run_backfill_batch($sites) {
    if (UMI_BACKFILL_MODE === 'single') {
        return um_run_backfill_single_article($sites);
    }
    // Otherwise use batch mode with binary search
}
```

**Admin UI (admin-endpoints.php):**
- Settings dropdown: "Batch (with binary search)" vs "Single Article (simple, slower)"
- Description explains trade-offs
- Mode saved in `um_backfill_mode` option

**Comparison:**

| Feature | Batch Mode | Single-Article Mode |
|---------|-----------|---------------------|
| **Complexity** | High (binary search) | Low (simple loop) |
| **Speed** | Fast (25-100 per batch) | Slower (1 per API call) |
| **Corrupt Articles** | Binary search identifies exact article | Skip after 3 retries |
| **API Calls** | Fewer (1 per batch) | More (1 per article) |
| **State Tracking** | Page + binary search state | Simple offset counter |
| **Use Case** | Production, fast imports | Debugging, problematic sites |

**Benefits:**
- Simple to understand and debug
- Predictable behavior
- No complex state management
- Perfect for sites with many corrupt articles
- Each article is independent

**Status:** ✅ Implemented 2026-01-04

---

### 13. Server-Side Backfill

**Decision:** Provide a fully automated server-side backfill that runs in the background via WordPress cron.

**Why:** Allow users to start backfill and close the browser, eliminating need to keep admin page open for "Run Continuous" mode.

**Implementation:**

**Cron Infrastructure (cron.php):**
```php
// New 1-minute interval
add_filter('cron_schedules', function ($schedules) {
    $schedules['um_every_minute'] = array(
        'interval' => 60,
        'display'  => 'Every 1 minute (UM)',
    );
});

// Server backfill cron handler
add_action('um_cron_server_backfill', function () {
    if (!get_option('um_server_backfill_active', false)) {
        return;
    }

    $result = um_run_backfill_batch(um_sites_config());
    update_option('um_server_backfill_last_run', time(), false);

    // Auto-stop when complete
    if (!empty($result['state']['done'])) {
        um_stop_server_backfill();
        update_option('um_server_backfill_completed', time(), false);
    }
});
```

**Control Functions:**
- `um_start_server_backfill()` - Enables flag, schedules cron
- `um_stop_server_backfill()` - Disables flag, unschedules cron
- `um_is_server_backfill_active()` - Check if running
- `um_get_server_backfill_status()` - Get status details

**Admin UI (admin-endpoints.php):**
- New "Server-Side Backfill" card
- 🚀 Start button (green, hero size)
- ⏸ Stop button (shown when active)
- Live status display:
  - Started timestamp
  - Last run timestamp
  - Next scheduled run
- Completion notification when done
- Tips box with recommended settings
- Page auto-refreshes every 10 seconds when active

**State Management:**
- `um_server_backfill_active` - Boolean flag
- `um_server_backfill_started` - Start timestamp
- `um_server_backfill_last_run` - Last execution time
- `um_server_backfill_completed` - Completion timestamp

**Behavior:**
1. User clicks "Start Server Backfill"
2. WordPress schedules cron event (runs every 60 seconds)
3. Each run processes one batch (respects mode + settings)
4. State persists between runs
5. Auto-stops when `state.done = true`
6. User can manually stop anytime

**Admin Handlers:**
- `admin_post_um_start_server_backfill` - Start action
- `admin_post_um_stop_server_backfill` - Stop action
- Success messages shown after redirect

**Recommended Settings for Fast Completion:**
- Backfill Mode: Single Article
- Backfill Pages Per Run: 25-50
- Result: ~30-60 minutes for 2,000+ articles

**Benefits:**
- No need to keep browser open
- Runs automatically in background
- Auto-stops when complete
- Visual progress monitoring (optional)
- Works with both batch and single-article modes

**Status:** ✅ Implemented 2026-01-04

---

### 14. Full-Text Search Implementation

**Decision:** Implement a custom search results page that searches only ingested articles (um_article CPT) with full-text search across title, excerpt, and complete article content.

**Why:** Enable users to search the aggregated content without mixing results with regular WordPress pages. Provides a unified search experience across all ingested articles from multiple sources.

**Implementation:**

**Search Module (search.php):**
```php
// Template interception - uses template_include with PHP_INT_MAX priority
// to override Divi's default search template
function um_search_template_override($template) {
    if (is_search() && !empty(get_search_query())) {
        return plugin_dir_path(__FILE__) . '../templates/search-results.php';
    }
    return $template;
}
add_filter('template_include', 'um_search_template_override', PHP_INT_MAX);

// Full-text search query
function um_get_search_results($search_term, $page, $per_page) {
    // Searches across:
    // - post_title
    // - post_content (excerpt)
    // - um_plaintext (full article content)
    // Uses -1 for per_page to show all results on one page
}
```

**Custom WHERE/JOIN Filters:**
- `um_search_where_custom()` - Adds LIKE clauses for title, excerpt, and um_plaintext
- `um_search_join_custom()` - Joins postmeta table for um_plaintext field
- `um_search_groupby_custom()` - Groups by post ID to avoid duplicates from JOIN

**Search Results Template (templates/search-results.php):**
- Server-side rendering with WordPress header/footer integration
- Integrates with Divi global header/footer
- Cleans up ET Builder search parameters via redirect
- Search form for query refinement (full width matching header divider)
- Article cards matching design spec:
  - Small thumbnail (100px × 75px desktop, 50% width × 200px mobile)
  - Large bold title
  - "BY [AUTHOR NAME]" in small caps (author, not source)
  - Publication date in gray text
  - Excerpt text
- All results displayed on single scrolling page (no pagination)
- "No results" messaging

**Styling (assets/search-results.css):**
- Clean, readable layout
- Responsive design (desktop, tablet, mobile)
- Mobile: Portrait thumbnail (50% width, 200px height) for better aspect ratio
- Full-width search bar matching header divider
- Hover states and transitions
- Proper typography hierarchy

**Key Features:**
1. **Exclusive to ingested articles:** Only searches um_article CPT, not regular WordPress content
2. **Full-text search:** Searches complete article plaintext stored in um_plaintext meta field
3. **SEO-friendly:** Server-side rendering, proper meta tags
4. **Performance:** Uses WP_Query with custom filters, results grouped to avoid duplicates
5. **Design match:** Layout matches provided design reference exactly
6. **No pagination:** All results on single page (pagination deferred for future implementation)
7. **Divi compatibility:** Template override works with Divi global header/footer
8. **ET Builder cleanup:** Automatically strips ET Builder search parameters

**Files Created:**
- `includes/search.php` - Core search logic and template interception
- `templates/search-results.php` - Search results page template
- `assets/search-results.css` - Search results styling

**Files Modified:**
- `united-media-ingestor.php` - Added require for search.php module

**Search Scope:**
- Searches: title, excerpt, and full article plaintext
- Does NOT search: category names (by design choice)
- Excludes: Articles marked with um_is_excluded flag
- Orders by: um_date_gmt (publication date) descending
- Returns: All matching results (no limit)

**Technical Details:**
- Template loading: `template_include` filter with `PHP_INT_MAX` priority
- ET Builder parameters cleaned: `et_pb_searchform_submit`, `et_pb_include_posts`, `et_pb_include_pages`
- Paged parameter handling: Checks multiple sources (`get_query_var('paged')`, `$_GET['paged']`)
- Search term handling: Uses global variable for filter coordination

**Known Limitations:**
- Pagination not implemented (all results displayed on one page)
- May be slow with very large result sets (500+ articles)
- Future enhancement: Implement lazy loading or pagination

**Status:** ✅ Implemented 2026-01-05

---

## Implementation Status

### ✅ Completed (2025-12-30)

1. **Taxonomy registration + activation routine** (§1) ✅
   - Hierarchical `um_category` taxonomy registered
   - Activation hook creates all 43 category terms (8 parents + 35 children)

2. **Category extraction + assignment** (§2, §3) ✅
   - Categories extracted from remote posts
   - Mapped to unified category system
   - Assigned during upsert
   - Parent categories returned in REST API for display

3. **Unmapped category tracking** (§2a) ✅
   - Tracks unmapped categories in `um_unmapped_categories` option
   - Increments count on each encounter

4. **Cursor-based backfill** (§5, §10) ✅
   - Implemented `um_fetch_posts_before()`
   - Supports both page-based and cursor-based modes

5. **Binary search for corrupt articles** (§11) ✅
   - Automatically identifies and skips corrupt articles
   - Minimizes data loss to 0.04%

6. **Field extraction** ✅
   - Featured images extracted and stored
   - Author names extracted (with custom authors plugin support)
   - Full article content stored as plaintext for search
   - Word count calculated for read time estimation
   - Read time displayed as "X min read" (200 words/minute)

7. **Frontend components** ✅
   - **`divi-feed-component.html`** - Initial generic feed component
   - **`divi-category-section.html`** - Production category section component
   - Multi-instance support (8 categories on same page)
   - Featured + regular article layouts per design spec
   - Responsive design with mobile reordering
   - Clock icons, read times, rounded thumbnails
   - Articles ordered by original publish date

8. **REST API ordering fix** ✅
   - Changed from `post_date` (insertion date) to `um_date_gmt` (publish date)
   - Articles now display in correct chronological order from source sites

9. **Single-article mode** (§12) ✅ (2026-01-04)
   - Alternative to batch mode with binary search
   - Fetches one article at a time (one API call per article)
   - Skips corrupt articles after 3 retries automatically
   - Simpler state management (offset-based tracking)
   - Admin setting to switch between modes

10. **Server-side backfill** (§13) ✅ (2026-01-04)
   - Fully automated background ingestion via WordPress cron
   - Runs every 60 seconds until complete
   - No need to keep browser open
   - Auto-stops when backfill completes
   - Live status monitoring with auto-refresh
   - Start/stop controls in admin UI

11. **Full-text search** (§14) ✅ (2026-01-05)
   - Custom search results page for ingested articles only
   - Full-text search across title, excerpt, and um_plaintext
   - Server-side rendering with Divi global header/footer integration
   - Responsive design matching provided spec
   - Shows all results on single page (no pagination)
   - Displays author name instead of source name
   - ET Builder parameter cleanup
   - Full-width search bar matching design
   - Mobile-optimized portrait thumbnails
   - Excludes regular WordPress pages/posts from results

### 🔴 Not Yet Implemented

1. **Error logging** (§9)
   - Last error stored in state (partial)
   - Rolling log of recent errors (needed)

2. **SSL verification hardening** (§4)
   - Currently `false` for dev
   - Set to `true` for production

3. **Search pagination** (§14 - deferred)
   - Currently shows all results on single page
   - Future: Implement pagination or lazy loading for large result sets
   - Consider performance impact with 500+ results

## Operational modes

### Backfill (archive ingestion)

Use for initial build or rebuilding the DB.
- For large sites, deep paging can 500 → prefer cursor-based backfill (`before=...`).
- State persists so it can resume.

### Incremental (new posts ingestion)

Runs repeatedly.
- Fetch posts since last cursor (`after=...`)
- Upsert
- Advance cursor

## Troubleshooting playbook

- **SSL certificate errors (cURL error 60)**
  - Fix the remote cert if possible.
  - For local dev only, you may disable verification (config flag).

- **Timeouts (cURL error 28)**
  - Increase timeout, reduce per_page, and/or increase backoff.
  - Prefer cursor-based fetch for large archives.

- **Remote HTTP 500 errors (corrupt articles)**
  - **Automatic handling:** Binary search algorithm (§11) automatically identifies and skips corrupt articles
  - No manual intervention needed — backfill continues automatically
  - Check admin UI for "Skipped Articles" count to see impact
  - Each skipped article is logged in state for audit trail
  - Data loss minimized to ~0.04% (only corrupt articles skipped)

- **Remote HTTP 500 at higher pages (deep pagination)**
  - Switch that site to cursor-based backfill (`backfill_mode => 'before_cursor'`).
  - Lower per_page.
  - Keep retries/backoff.

## Safety constraints

- Keep the CPT non-public and non-queryable.
- Do not expose full remote content publicly unless required.
- Click-through should always take the user to the remote source URL.

## Future improvements

- Enhanced search endpoint with full-text search (content now stored, needs implementation)
- Admin search UI for finding articles
- Re-run mapping tool after category spec changes
- Unmapped categories admin panel
- Rolling error log (last 100 errors)
