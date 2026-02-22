# Field Extraction Analysis

Last updated: 2026-01-03

---

## Current Extraction Status (Updated 2025-12-30)

### ✅ All Fields Extracted & Stored

| Field | Source in Remote Post | Stored As | Extraction Code Location | Status |
|-------|----------------------|-----------|--------------------------|--------|
| **Title** | `title.rendered` | `post_title` | `storage.php:153-158` | ✅ |
| **Excerpt** | `excerpt.rendered` | `post_content` | `storage.php:164-168` | ✅ |
| **Full Content** | `content.rendered` | `um_plaintext` meta | `storage.php:170-181` | ✅ 2025-12-30 |
| **Word Count** | calculated | `um_word_count` meta | `storage.php:251-252` | ✅ 2025-12-30 |
| **Featured Image** | `_embedded['wp:featuredmedia'][0]['source_url']` | `um_featured_image_url` meta | `storage.php:183-187` | ✅ 2025-12-30 |
| **Author Name** | `_embedded['author'][0]['name']` or `authors[0]['display_name']` | `um_author_name` meta | `storage.php:189-199` | ✅ 2025-12-30 |
| **Categories** | `_embedded['wp:term']` (taxonomy='category') | `um_category` taxonomy | `storage.php:256-270` | ✅ 2025-12-30 |
| **Source URL** | `link` | `um_source_url` meta | `storage.php:160, 229` | ✅ |
| **Remote Post ID** | `id` | `um_remote_post_id` meta | `storage.php:148, 228` | ✅ |
| **Date GMT** | `date_gmt` | `um_date_gmt` meta | `storage.php:161, 232` | ✅ |
| **Date Local** | `date` | `um_date_local` meta | `storage.php:162, 233` | ✅ |
| **Source Site ID** | config | `um_source_site` meta | `storage.php:227` | ✅ |
| **Source Label** | config | `um_source_label` meta | `storage.php:236` | ✅ |
| **Raw Data** | multiple | `um_raw_min` meta (JSON) | `storage.php:281-289` | ✅ |

**Total fields stored:** 14 ✅ (was 9, added 5 new fields on 2025-12-30)

---

## ✅ Previously Missing Fields (Now Implemented)

These fields were **required** for frontend display parity - all now implemented on 2025-12-30:

### 1. Featured Image URL ✅ IMPLEMENTED

**Why needed:** Every article card shows a thumbnail

**Source in remote post:**
```json
{
  "_embedded": {
    "wp:featuredmedia": [
      {
        "source_url": "https://example.com/wp-content/uploads/2025/01/image.jpg",
        "media_details": {
          "sizes": {
            "thumbnail": { "source_url": "..." },
            "medium": { "source_url": "..." },
            "large": { "source_url": "..." }
          }
        }
      }
    ]
  }
}
```

**Extraction code needed:**
```php
// In um_upsert_article() after line 153

$featured_image = '';
if (!empty($remote_post['_embedded']['wp:featuredmedia'][0]['source_url'])) {
    $featured_image = esc_url_raw($remote_post['_embedded']['wp:featuredmedia'][0]['source_url']);
}

// Store after line 190
if ($featured_image) {
    update_post_meta($post_id, 'um_featured_image_url', $featured_image);
}
```

**Implementation Status:** ✅ Fully implemented in `storage.php:183-187, 239-241`
**Fallback strategy:** If no featured image, frontend renders gray placeholder

---

### 2. Author Name ✅ IMPLEMENTED

**Why needed:** Article cards display author attribution

**Source in remote post (two possible formats):**

**Format 1: Standard WP Author (via _embed)**
```json
{
  "_embedded": {
    "author": [
      {
        "id": 123,
        "name": "John Smith",
        "avatar_urls": {
          "96": "https://example.com/avatar.jpg"
        }
      }
    ]
  }
}
```

**Format 2: Custom Authors Plugin (some sites use this)**
```json
{
  "authors": [
    {
      "id": 456,
      "display_name": "Jane Doe",
      "avatar_url": "https://example.com/custom-avatar.jpg"
    }
  ]
}
```

**Extraction code needed:**
```php
// In um_upsert_article() after featured image extraction

$author_name = 'Staff Writer'; // Default fallback

// Check custom authors plugin first (multi-author / guest authors)
if (!empty($remote_post['authors'][0]['display_name'])) {
    $author_name = sanitize_text_field($remote_post['authors'][0]['display_name']);
}
// Fallback to standard WP author
else if (!empty($remote_post['_embedded']['author'][0]['name'])) {
    $author_name = sanitize_text_field($remote_post['_embedded']['author'][0]['name']);
}

// Store
update_post_meta($post_id, 'um_author_name', $author_name);
```

**Implementation Status:** ✅ Fully implemented in `storage.php:189-199, 242-244`
**Default Value:** "Not Credited" (user preference)

---

### 3. Categories ✅ IMPLEMENTED (Complete System)

**Why needed:**
- Display category badge on cards
- Filter articles by category
- Search by category
- Core feature of unified category system

**Source in remote post:**
```json
{
  "_embedded": {
    "wp:term": [
      [
        {
          "id": 57,
          "name": "Business & Investment",
          "slug": "business",
          "taxonomy": "category"
        },
        {
          "id": 60,
          "name": "Economy",
          "slug": "economy",
          "taxonomy": "category"
        }
      ],
      [
        {
          "id": 89,
          "name": "breaking-news",
          "slug": "breaking-news",
          "taxonomy": "post_tag"
        }
      ]
    ]
  }
}
```

**Note:** `wp:term` is an array of arrays. First sub-array contains categories, second contains tags.

**Implementation required:**

1. **Extract categories from remote post** (`includes/normalize.php`)
```php
function um_extract_remote_categories($remote_post) {
    $categories = array();

    if (empty($remote_post['_embedded']['wp:term'])) {
        return $categories;
    }

    // wp:term is array of arrays - first is usually categories
    foreach ($remote_post['_embedded']['wp:term'] as $term_group) {
        if (!is_array($term_group)) continue;

        foreach ($term_group as $term) {
            // Only extract categories (not tags)
            if (!empty($term['taxonomy']) && $term['taxonomy'] === 'category') {
                if (!empty($term['name'])) {
                    $categories[] = sanitize_text_field($term['name']);
                }
            }
        }
    }

    return $categories;
}
```

2. **Register taxonomy** (`includes/storage.php` - add before line 33)
```php
// Register um_category taxonomy
register_taxonomy('um_category', array('um_article'), array(
    'labels' => array(
        'name' => 'UM Categories',
        'singular_name' => 'UM Category',
    ),
    'hierarchical' => true,        // Parent/child structure
    'public' => false,             // Internal only
    'show_ui' => true,             // Show in admin
    'show_in_rest' => true,        // Enable REST API filtering
    'rewrite' => false,            // No public URLs
    'query_var' => false,
));
```

3. **Assign categories during upsert** (`includes/storage.php` - add after author extraction)
```php
// Extract and map categories
$remote_categories = um_extract_remote_categories($remote_post);

if (!empty($remote_categories)) {
    $resolution = um_resolve_categories($site_id, $remote_categories);

    if (!empty($resolution['mapped_slugs'])) {
        wp_set_object_terms($post_id, $resolution['mapped_slugs'], 'um_category', false);
    }

    // Track unmapped categories
    if (!empty($resolution['unmapped'])) {
        um_track_unmapped_categories($site_id, $resolution['unmapped']);
    }

    // Mark as excluded if all categories excluded
    if ($resolution['is_excluded']) {
        update_post_meta($post_id, 'um_is_excluded', 1);
        if (!empty($resolution['excluded_reason'])) {
            update_post_meta($post_id, 'um_excluded_reason', $resolution['excluded_reason']);
        }
    }
}
```

4. **Activation hook to create terms** (`united-media-ingestor.php`)
```php
register_activation_hook(__FILE__, 'um_activate_plugin');

function um_activate_plugin() {
    // Create parent categories
    $parents = um_category_parents();
    foreach ($parents as $slug => $data) {
        if (!term_exists($slug, 'um_category')) {
            wp_insert_term($data['name'], 'um_category', array(
                'slug' => $slug,
                'description' => $data['desc'],
            ));
        }
    }

    // Create child categories
    $children = um_category_children_spec();
    foreach ($children as $parent_slug => $kids) {
        $parent_term = get_term_by('slug', $parent_slug, 'um_category');
        if (!$parent_term) continue;

        foreach ($kids as $child_slug => $child_data) {
            if (!term_exists($child_slug, 'um_category')) {
                wp_insert_term($child_data['name'], 'um_category', array(
                    'slug' => $child_slug,
                    'description' => $child_data['desc'],
                    'parent' => $parent_term->term_id,
                ));
            }
        }
    }

    flush_rewrite_rules();
}
```

**Implementation Status:** ✅ Complete category system implemented:
- Taxonomy registered (`storage.php:34-47`)
- Extraction helper (`normalize.php:16-40`)
- Activation hook (`united-media-ingestor.php:29-91`)
- Assignment during upsert (`storage.php:256-270`)
- Unmapped tracking (`storage.php:307-337`)
- Parent category detection (`rest-api.php:133-145`)

---

## Optional Enhancement Fields

### Author Avatar (LOW PRIORITY)

**Why nice-to-have:** Can show author photo on article cards

**Extraction code:**
```php
$author_avatar = '';

// Custom authors plugin format
if (!empty($remote_post['authors'][0]['avatar_url'])) {
    if (is_string($remote_post['authors'][0]['avatar_url'])) {
        $author_avatar = esc_url_raw($remote_post['authors'][0]['avatar_url']);
    } else if (!empty($remote_post['authors'][0]['avatar_url']['url'])) {
        $author_avatar = esc_url_raw($remote_post['authors'][0]['avatar_url']['url']);
    }
}
// WP author avatar (96px size)
else if (!empty($remote_post['_embedded']['author'][0]['avatar_urls']['96'])) {
    $author_avatar = esc_url_raw($remote_post['_embedded']['author'][0]['avatar_urls']['96']);
}

if ($author_avatar) {
    update_post_meta($post_id, 'um_author_avatar', $author_avatar);
}
```

---

### Full Content ✅ IMPLEMENTED

**Why useful:** Enhanced full-text search

**Previous:** Storing excerpt only (~30-100 words)
**Current:** ✅ Full plaintext content now stored

**Extraction code (implemented in storage.php:170-181):**
```php
$plaintext = '';
if (!empty($remote_post['content']['rendered'])) {
    $html = $remote_post['content']['rendered'];
    // Strip all HTML tags and shortcodes
    $plaintext = wp_strip_all_tags(strip_shortcodes($html));
    // Normalize whitespace
    $plaintext = preg_replace('/\s+/', ' ', $plaintext);
    $plaintext = trim($plaintext);
}

if ($plaintext) {
    update_post_meta($post_id, 'um_plaintext', $plaintext);

    // Calculate word count for read time
    $word_count = str_word_count($plaintext);
    update_post_meta($post_id, 'um_word_count', $word_count);
}
```

**Implementation Status:** ✅ Fully implemented in `storage.php:170-181, 246-253`
**Storage impact:** 2,216 articles × ~2-5KB = ~10-20MB additional storage
**REST API Access:** Available via `?include_content=1` parameter (optional to keep responses fast)

---

## Implementation Status

### ✅ Phase 1: Complete (2025-12-30)
1. ✅ **Featured Image** - Implemented
2. ✅ **Author Name** - Implemented
3. ✅ **Categories** - Complete system implemented
   - ✅ Register taxonomy
   - ✅ Create activation hook
   - ✅ Extract from remote posts
   - ✅ Map to unified categories
   - ✅ Assign during upsert
   - ✅ Track unmapped
4. ✅ **Full Content Storage** - Implemented
5. ✅ **Read Time Calculation** - Implemented

**Total implementation time:** ~3-4 hours (completed)

### Optional Enhancements (Not Implemented)
- Author Avatar - 15 minutes (low priority, nice-to-have)

---

## Files Modified (2025-12-30)

### ✅ Implemented
- **`includes/storage.php`** - ✅ Modified `um_upsert_article()` with all field extractions
- **`includes/normalize.php`** - ✅ Added `um_extract_remote_categories()` helper
- **`united-media-ingestor.php`** - ✅ Added activation hook for category terms
- **`includes/mapping.php`** - ✅ Already has mapping functions (no changes needed)
- **`includes/rest-api.php`** - ✅ Returns all new fields + parent categories
- **`divi-feed-component.html`** - ✅ Created complete frontend component (NEW)

---

## Current REST API Response (Implemented 2025-12-30)

```json
{
  "page": 1,
  "per_page": 20,
  "total": 2179,
  "total_pages": 109,
  "items": [
    {
      "id": 123,
      "title": "Breaking News: Major Development",
      "date": "2025-12-30T10:30:00",
      "source": "diplomaticwatch",
      "source_label": "Diplomatic Watch",
      "source_url": "https://diplomaticwatch.com/article-slug",
      "excerpt": "Article excerpt text...",
      "featured_image": "https://diplomaticwatch.com/wp-content/uploads/image.jpg",
      "author_name": "John Smith",
      "category": "World News & Politics",
      "categories": [
        {
          "id": 45,
          "name": "World News & Politics",
          "slug": "world-news-politics",
          "parent": 0
        },
        {
          "id": 67,
          "name": "Diplomatic Watch: Africa",
          "slug": "dw-africa",
          "parent": 45
        }
      ],
      "read_time_minutes": 5,
      "is_excluded": false
    }
  ]
}
```

**Note:** Full content available with `?include_content=1` parameter.

---

## Testing Strategy

### ✅ Implementation Complete - Ready for Testing

**Required Testing Steps:**

1. **Activate category system:**
   - Deactivate plugin
   - Reactivate plugin (creates 43 category terms)
   - Verify terms created: UM Articles → UM Categories

2. **Re-import with new fields:**
   - Delete all articles
   - Reset backfill state
   - Run continuous backfill

3. **Verify data extraction:**
   - ✅ Check that `um_featured_image_url` meta exists
   - ✅ Check that `um_author_name` meta exists
   - ✅ Check that `um_category` terms are assigned
   - ✅ Check that `um_plaintext` meta exists
   - ✅ Check that `um_word_count` meta exists

4. **Test REST API:**
   - Visit: `/wp-json/um/v1/articles?per_page=5`
   - Verify all fields returned: featured_image, author_name, category, read_time_minutes
   - Test category filtering: `?category=world-news-politics`
   - Test optional content: `?include_content=1`

5. **Test Divi component:**
   - Copy contents of `divi-feed-component.html` into Divi Code Module
   - Verify cards display with images, authors, categories, read times
   - Test "Load More" pagination
   - Verify links to original articles work

---

## Status Summary

### ✅ All Requested Features Implemented (2025-12-30)

**Field Extraction:** ✅ Complete
- Featured images
- Author names
- Categories (full system)
- Full content + word count
- Read time calculation

**REST API:** ✅ Complete
- Returns all new fields
- Parent category detection
- Optional content parameter
- Category filtering ready

**Frontend Component:** ✅ Complete
- Standalone Divi component
- Displays all fields automatically
- Hero + grid layout
- Load more pagination

**Next Step:** User testing after plugin reactivation and data re-import

---

## Frontend Component Update (2026-01-03)

### ✅ New Production Component: `divi-category-section.html`

**Purpose:** Replace generic feed with individual category sections for the 8 parent categories.

**Key Improvements over `divi-feed-component.html`:**
1. **Category-specific** - Each instance shows articles from one category only
2. **Featured + regular layout** - 2 featured cards (prominent) + 6 regular cards (compact)
3. **Multi-instance support** - 8 copies can run independently on same page
4. **Responsive design** - Optimized for both desktop and mobile viewing
5. **Design spec implementation** - Matches reference.png design requirements

**Component Features:**
- Featured articles: Full-width images with gradient overlays, title on image
- Regular articles: Horizontal layout with 140px rounded thumbnails
- Clock icons (🕐) before read times
- 3-line title truncation with ellipsis
- Proper publish date ordering (not ingestion date)
- Loading skeletons and error states
- Independent state management per instance

**Files:**
- `divi-category-section.html` - New production component (replaces divi-feed-component.html for category sections)
- `includes/rest-api.php` - Fixed to order by `um_date_gmt` (original publish date)

**Status:** ✅ Production-ready, deployed in Divi Code Modules

---

## Resolved Decisions

1. **Full content storage:** ✅ IMPLEMENTED - Full plaintext stored for enhanced search
2. **Author avatars:** ⏸️ DEFERRED - Low priority, nice-to-have feature
3. **Tags:** ⏸️ NOT IMPLEMENTED - Categories sufficient for v1
4. **Featured image sizes:** ✅ DECIDED - Store full size only, browser handles resizing
5. **Category display:** ✅ DECIDED - Show parent category (unified bucket) on cards
