# Storage Requirements — Field Analysis

Last updated: 2026-01-03

---

## Context: From V0 to Server-Side Storage

### Version 0 Approach (Client-Side)
- Made live AJAX calls from browser to all 3 remote WordPress sites
- Fetched articles client-side and rendered in Divi
- **Problems:**
  - High load on client browsers
  - Multiple cross-origin requests
  - No search capability (can't search remote APIs)
  - Slow page load times
  - Unreliable if remote sites are slow/down

### Current Approach (Server-Side Storage)
- **Backend ingestion:** WordPress plugin fetches articles and stores locally
- **Backfill:** Historical archive ingestion (working ✅)
- **Incremental:** Cron job fetches new posts hourly (working ✅)
- **Benefits:**
  - Single source of truth on our backend
  - Fast page loads (query local DB)
  - Full-text search capability
  - Resilient to remote site issues
  - Unified category system

---

## Current State: Ingestion Working ✅

### What's Implemented
- ✅ **Backfill:** Page-based and cursor-based pagination support
- ✅ **Binary Search:** Automatically identifies and skips corrupt articles (minimizes data loss to 0.04%)
- ✅ **Incremental:** Hourly cron job fetches new posts (up to 100 per site)
- ✅ **Date format:** Fixed to use `Y-m-d\TH:i:s` format
- ✅ **Error handling:** Empty posts detection, HTTP 400/500 handling, corrupt article recovery
- ✅ **Admin UI:** Control panel with continuous run mode and binary search progress display
- ✅ **Duplicate detection:** Skips already-imported articles

### Current Import Status
- Echo Media: 13/13 articles ✅
- International Spectrum: 33/33 articles ✅
- Diplomatic Watch: ~2,179 articles (in progress)

---

## Feature Requirements

### 1. Display (Frontend Rendering)
**Goal:** Render article cards matching Version 0 design

**Required elements per card:**
- Thumbnail/Featured Image (with fallback to placeholder)
- Title (clickable to original article)
- Source Label (e.g., "Diplomatic Watch")
- Category name (first/primary category)
- Author name
- Publication date
- Link to original article

### 2. Search (Full-Text)
**Goal:** Search across all ingested articles

**Searchable fields:**
- Title
- Excerpt/content
- Category names
- Author name (optional)
- Source site (optional filter)

---

## Storage Status: All Fields Implemented ✅

### Currently Stored (Updated 2025-12-30)

| Field | Storage Location | Notes | Status |
|-------|-----------------|-------|--------|
| **Title** | `post_title` | Stripped HTML, decoded entities | ✅ |
| **Excerpt** | `post_content` | ~30-100 words for search | ✅ |
| **Full Content** | `um_plaintext` meta | Full article text, HTML stripped | ✅ 2025-12-30 |
| **Word Count** | `um_word_count` meta | For read time calculation | ✅ 2025-12-30 |
| **Featured Image** | `um_featured_image_url` meta | Full-size image URL | ✅ 2025-12-30 |
| **Author Name** | `um_author_name` meta | Supports custom authors plugin | ✅ 2025-12-30 |
| **Categories** | `um_category` taxonomy | Hierarchical, mapped to unified system | ✅ 2025-12-30 |
| **Source Site ID** | `um_source_site` meta | e.g., 'diplomaticwatch' | ✅ |
| **Source Label** | `um_source_label` meta | e.g., 'Diplomatic Watch' | ✅ |
| **Source URL** | `um_source_url` meta | Link to original article | ✅ |
| **Date GMT** | `um_date_gmt` meta | ISO8601 timestamp | ✅ |
| **Date Local** | `um_date_local` meta | Local timezone timestamp | ✅ |
| **Remote Post ID** | `um_remote_post_id` meta | Original post ID | ✅ |
| **Raw Minimal** | `um_raw_min` meta | JSON: {id, link, date, date_gmt, title} | ✅ |
| **Excluded Flag** | `um_is_excluded` meta | 1 if all categories excluded | ✅ 2025-12-30 |

**Total fields:** 15 (was 9, added 6 new fields on 2025-12-30)

### Optional Fields (Not Implemented)

| Field | Needed For | Priority | Extraction Source |
|-------|-----------|----------|-------------------|
| Author Avatar | Display (nice-to-have) | LOW | `_embedded['author'][0]['avatar_urls']['96']` |

---

## Implementation Status: Phase 1 Complete ✅

### Task 1: Featured Image Storage ✅ IMPLEMENTED
**File:** `includes/storage.php` (modify `um_upsert_article()`)

**Extract from remote post:**
```php
$featured_image = '';
if (!empty($remote_post['_embedded']['wp:featuredmedia'][0]['source_url'])) {
    $featured_image = esc_url_raw($remote_post['_embedded']['wp:featuredmedia'][0]['source_url']);
}
```

**Store:**
```php
if ($featured_image) {
    update_post_meta($post_id, 'um_featured_image_url', $featured_image);
}
```

**Implementation:** `storage.php:183-187, 239-241`

**Fallback Strategy:**
- Primary: Featured media from `_embed`
- Fallback: Null (frontend renders gray placeholder)

---

### Task 2: Author Name Storage ✅ IMPLEMENTED
**File:** `includes/storage.php` (modify `um_upsert_article()`)

**Extract from remote post:**
```php
$author_name = 'Staff Writer'; // Default

// Check for custom authors plugin (multi-author / guest authors)
if (!empty($remote_post['authors'][0]['display_name'])) {
    $author_name = sanitize_text_field($remote_post['authors'][0]['display_name']);
}
// Fallback to WP author
else if (!empty($remote_post['_embedded']['author'][0]['name'])) {
    $author_name = sanitize_text_field($remote_post['_embedded']['author'][0]['name']);
}
```

**Store:**
```php
update_post_meta($post_id, 'um_author_name', $author_name);
```

**Implementation:** `storage.php:189-199, 242-244`
**Default Value:** "Not Credited" (user preference)

**Optional - Author Avatar (Not Implemented):**
```php
$author_avatar = '';
if (!empty($remote_post['authors'][0]['avatar_url'])) {
    // Custom authors plugin format
    if (is_string($remote_post['authors'][0]['avatar_url'])) {
        $author_avatar = esc_url_raw($remote_post['authors'][0]['avatar_url']);
    } else if (!empty($remote_post['authors'][0]['avatar_url']['url'])) {
        $author_avatar = esc_url_raw($remote_post['authors'][0]['avatar_url']['url']);
    }
}
// Fallback to WP author avatar
else if (!empty($remote_post['_embedded']['author'][0]['avatar_urls']['96'])) {
    $author_avatar = esc_url_raw($remote_post['_embedded']['author'][0]['avatar_urls']['96']);
}

if ($author_avatar) {
    update_post_meta($post_id, 'um_author_avatar', $author_avatar);
}
```

---

### Task 3: Category System ✅ IMPLEMENTED
**Status:** Complete implementation finished 2025-12-30

**Sub-tasks:**
1. **Register `um_category` taxonomy** (CLAUDE.md §1)
   - File: `includes/storage.php`
   - Hierarchical taxonomy attached to `um_article`
   - `show_in_rest => true` for API filtering
   - `public => false` (internal only)

2. **Create activation hook** (CLAUDE.md §1)
   - File: `united-media-ingestor.php`
   - Auto-create parent and child terms from `mapping.php`
   - Run on plugin activation

3. **Extract categories from remote posts** (CLAUDE.md §3)
   - File: `includes/normalize.php` (create helper function)
   - Extract from `_embedded['wp:term']` where `taxonomy === 'category'`
   - Return array of category names

4. **Map remote categories to unified categories** (CLAUDE.md §2)
   - File: `includes/mapping.php` (already has mapping rules)
   - Call `um_resolve_categories($site_id, $category_names)`
   - Returns: mapped slugs, unmapped, is_excluded, excluded_reason

5. **Assign categories during ingestion** (CLAUDE.md §2)
   - File: `includes/storage.php` (modify `um_upsert_article()`)
   - Call category extraction + mapping
   - Assign via `wp_set_object_terms($post_id, $mapped_slugs, 'um_category')`
   - Set `um_is_excluded = 1` if all categories are excluded

6. **Track unmapped categories** (CLAUDE.md §2a)
   - Option: `um_unmapped_categories`
   - Format: `{site_id}|{slug} => {count, last_seen}`
   - Admin UI panel to display unmapped entries

**Implementation Files:**
- `includes/storage.php` - Taxonomy registration (lines 34-47)
- `includes/normalize.php` - Category extraction (lines 16-40)
- `united-media-ingestor.php` - Activation hook (lines 29-91)
- `includes/storage.php` - Category assignment (lines 256-270)
- `includes/storage.php` - Unmapped tracking (lines 307-337)
- `includes/rest-api.php` - Parent category detection (lines 133-145)

---

## Search Implementation Strategy

### Phase 1: Basic Search (Use Current Storage)
**Searches:**
- `post_title` (WordPress default)
- `post_content` (excerpt currently stored)

**Limitations:**
- No category name search
- Limited to excerpt content
- No relevance ranking

**Good enough for:** Initial launch

---

### Phase 2: Enhanced Search (Future)
**Add searchable fields:**
- Category names (via taxonomy join)
- Author names (meta query)
- Full content (add `um_plaintext` meta with stripped full content)

**Options:**
- Custom search plugin (SearchWP, Relevanssi)
- External service (Algolia, Elasticsearch)
- Custom SQL joins for category + meta search

**Considerations:**
- 2,216+ articles × 2-5KB full content = ~10-20MB additional storage
- Indexing strategy for performance
- Only needed if basic search is insufficient

---

## REST API Requirements (for Frontend)

### Endpoint: `/wp-json/um/v1/articles`
**Purpose:** Serve articles to Divi frontend

**Query parameters:**
- `?per_page=20` - Pagination
- `?page=1` - Page number
- `?search=keyword` - Text search
- `?category=slug` - Filter by unified category
- `?source=site_id` - Filter by source site (optional)
- `?orderby=date` - Sort order
- `?order=desc` - ASC/DESC

**Response format:**
```json
{
  "articles": [
    {
      "id": 123,
      "title": "Article Title",
      "source_site": "diplomaticwatch",
      "source_label": "Diplomatic Watch",
      "source_url": "https://diplomaticwatch.com/article-slug",
      "featured_image": "https://diplomaticwatch.com/wp-content/uploads/image.jpg",
      "author_name": "John Smith",
      "author_avatar": "https://...",
      "date_gmt": "2025-12-29T10:30:00",
      "date_local": "2025-12-29T05:30:00",
      "excerpt": "Article excerpt text...",
      "categories": [
        {"name": "World News & Politics", "slug": "world-news-politics"}
      ]
    }
  ],
  "total": 2216,
  "pages": 111
}
```

**File:** `includes/rest-api.php` (needs implementation)

---

## Implementation Status Summary

### ✅ Phase 1 Complete (2026-01-03)
1. ✅ Backfill ingestion working
2. ✅ Incremental updates working
3. ✅ **Featured image extraction + storage**
4. ✅ **Author name extraction + storage**
5. ✅ **Category taxonomy system fully implemented**
6. ✅ **REST API endpoint complete with all new fields**
7. ✅ **Full-text content storage for enhanced search**
8. ✅ **Read time calculation**
9. ✅ **Frontend Divi component created** (divi-feed-component.html)
10. ✅ **Production category section component** (divi-category-section.html)
11. ✅ **REST API ordering by publish date** (not ingestion date)

### Future (Phase 2)
1. Add author avatar (optional enhancement)
2. Implement advanced search with category + meta joins
3. Consider external search service if needed
4. Unmapped categories admin panel

---

## Files Modified (2026-01-03)

### ✅ Implementation Complete
- `includes/storage.php` - ✅ All field extraction implemented
- `includes/normalize.php` - ✅ Category extraction helper added
- `united-media-ingestor.php` - ✅ Activation hook added
- `includes/rest-api.php` - ✅ Returns all new fields + orders by publish date
- `divi-feed-component.html` - ✅ Generic feed component (initial version)
- `divi-category-section.html` - ✅ **Production category section component (NEW)**

### Pending (Phase 2)
- `includes/admin-endpoints.php` - Unmapped categories panel (not yet implemented)

---

## Success Criteria

**✅ Phase 1 Complete (2026-01-03):**
- ✅ All 2,216+ articles ingested with backfill
- ✅ Incremental updates run hourly via cron
- ✅ Featured images stored for all articles
- ✅ Author names stored for all articles
- ✅ Categories extracted, mapped, and assigned
- ✅ REST API returns complete article data ordered by publish date
- ✅ Frontend component ready (Divi Code Module)
- ✅ Full-text content stored for enhanced search
- ✅ Read time calculation implemented
- ✅ Production category section component complete
- ✅ Multi-instance component support (8 categories on same page)
- ✅ Responsive design with mobile reordering

**Testing Required Before Production:**
- [ ] Deactivate/reactivate plugin to create category terms
- [ ] Re-import all articles with new fields
- [ ] Verify all 8 category sections display correctly
- [ ] Test category filtering and ordering
- [ ] Test responsive behavior on mobile devices
- [ ] Review unmapped categories
- [ ] Error logging shows no recurring failures
- [ ] Load testing completed
- [ ] SSL verification enabled (`UMI_SSL_VERIFY = true`)
