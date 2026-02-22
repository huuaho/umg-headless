# Category Mapping Documentation

Last updated: 2025-12-29

---

## Overview

This document defines how remote WordPress categories from our 3 source sites are mapped to our unified category system.

**Source Sites:**
- Diplomatic Watch: 26 categories
- Echo Media: 4 categories
- International Spectrum: 7 categories

**Total Remote Categories:** 37
**Total Unified Categories:** 8 parent + 35 child = 43 total
**Excluded Categories:** 4 (ingested but hidden)

---

## Unified Category Structure

Our unified taxonomy is **hierarchical** with 8 top-level parents and site-specific child categories.

### Parent Categories

1. **World News & Politics** (`world-news-politics`)
2. **Profiles & Opinions** (`profiles-opinions`)
3. **Economy & Business** (`economy-business`)
4. **Diplomacy** (`diplomacy`)
5. **Art & Culture** (`art-culture`)
6. **Education & Youth** (`education-youth`) _(may remove later)_
7. **Local Community** (`local-community`)
8. **Wellbeing, Environment, Technology** (`wellbeing-env-tech`)

---

## Complete Category Mapping

### 1. World News & Politics

**Child Categories:**
- `dw-africa` — Diplomatic Watch: Africa
- `dw-americas` — Diplomatic Watch: Americas
- `dw-asia` — Diplomatic Watch: Asia
- `dw-europe` — Diplomatic Watch: Europe
- `dw-know-your-president` — Diplomatic Watch: Know your President
- `dw-middle-east` — Diplomatic Watch: Middle East
- `dw-news-update` — Diplomatic Watch: News Update
- `dw-oceania` — Diplomatic Watch: Oceania
- `dw-politics-policy` — Diplomatic Watch: Politics & Policy
- `dw-regions` — Diplomatic Watch: Regions

**Remote Category Mappings:**
| Site | Remote Category | Maps To |
|------|----------------|---------|
| Diplomatic Watch | Africa | `dw-africa` |
| Diplomatic Watch | Americas | `dw-americas` |
| Diplomatic Watch | Asia | `dw-asia` |
| Diplomatic Watch | Europe | `dw-europe` |
| Diplomatic Watch | Know Your President | `dw-know-your-president` |
| Diplomatic Watch | Middle East | `dw-middle-east` |
| Diplomatic Watch | News Update | `dw-news-update` |
| Diplomatic Watch | Oceania | `dw-oceania` |
| Diplomatic Watch | Politics & Policy | `dw-politics-policy` |
| Diplomatic Watch | Regions | `dw-regions` |

---

### 2. Profiles & Opinions

**Child Categories:**
- `dw-editorial` — Diplomatic Watch: Editorial
- `dw-interview` — Diplomatic Watch: Interview
- `dw-opinion` — Diplomatic Watch: Opinion
- `is-history-legacy` — International Spectrum: History & Legacy

**Remote Category Mappings:**
| Site | Remote Category | Maps To |
|------|----------------|---------|
| Diplomatic Watch | Editorial | `dw-editorial` |
| Diplomatic Watch | Interview | `dw-interview` |
| Diplomatic Watch | Opinion | `dw-opinion` |
| International Spectrum | History & Legacy | `is-history-legacy` |

---

### 3. Economy & Business

**Child Categories:**
- `dw-economy` — Diplomatic Watch: Economy
- `dw-business-investment` — Diplomatic Watch: Business & Investment

**Remote Category Mappings:**
| Site | Remote Category | Maps To |
|------|----------------|---------|
| Diplomatic Watch | Economy | `dw-economy` |
| Diplomatic Watch | Business & Investment | `dw-business-investment` |

---

### 4. Diplomacy

**Child Categories:**
- `dw-diplomacy` — Diplomatic Watch: Diplomacy
- `dw-appointments` — Diplomatic Watch: Appointments

**Remote Category Mappings:**
| Site | Remote Category | Maps To |
|------|----------------|---------|
| Diplomatic Watch | Diplomacy | `dw-diplomacy` |
| Diplomatic Watch | Appointments | `dw-appointments` |

---

### 5. Art & Culture

**Child Categories:**
- `dw-cultural-connections` — Diplomatic Watch: Cultural Connections
- `dw-culture-tourism` — Diplomatic Watch: Culture & Tourism
- `dw-fashion-lifestyle` — Diplomatic Watch: Fashion & Lifestyle
- `dw-sports` — Diplomatic Watch: Sports
- `em-art-culture` — Echo Media: Art & Culture
- `is-arts` — International Spectrum: Arts
- `is-civic-cultural` — International Spectrum: Civic & Cultural Affairs

**Remote Category Mappings:**
| Site | Remote Category | Maps To |
|------|----------------|---------|
| Diplomatic Watch | Cultural Connections | `dw-cultural-connections` |
| Diplomatic Watch | Culture & Tourism | `dw-culture-tourism` |
| Diplomatic Watch | Fashion & Lifestyle | `dw-fashion-lifestyle` |
| Diplomatic Watch | Sports | `dw-sports` |
| Echo Media | Art & Culture | `em-art-culture` |
| International Spectrum | Arts | `is-arts` |
| International Spectrum | Civic & Cultural Affairs | `is-civic-cultural` |

---

### 6. Education & Youth

**Note:** May eventually remove this category.

**Child Categories:**
- `em-education` — Echo Media: Education
- `is-leadership-youth` — International Spectrum: Leadership & Youth Engagement

**Remote Category Mappings:**
| Site | Remote Category | Maps To |
|------|----------------|---------|
| Echo Media | Education | `em-education` |
| International Spectrum | Leadership & Youth Engagement | `is-leadership-youth` |

---

### 7. Local Community

**Child Categories:**
- `dw-events` — Diplomatic Watch: Events
- `is-social-impact` — International Spectrum: Social Impact & Justice
- `is-community-programs` — International Spectrum: Community & Public Programs

**Remote Category Mappings:**
| Site | Remote Category | Maps To |
|------|----------------|---------|
| Diplomatic Watch | Events | `dw-events` |
| International Spectrum | Social Impact & Justice | `is-social-impact` |
| International Spectrum | Community & Public Programs | `is-community-programs` |

---

### 8. Wellbeing, Environment, Technology

**Child Categories:**
- `dw-technology` — Diplomatic Watch: Technology
- `em-nature` — Echo Media: Nature
- `dw-health` — Diplomatic Watch: Health

**Remote Category Mappings:**
| Site | Remote Category | Maps To |
|------|----------------|---------|
| Diplomatic Watch | Technology | `dw-technology` |
| Echo Media | Nature | `em-nature` |
| Diplomatic Watch | Health | `dw-health` |

---

## Excluded Categories

These categories are **ingested but marked as excluded** (`um_is_excluded = 1`). They are stored for data parity but hidden from display by default.

| Site | Remote Category | Reason |
|------|----------------|--------|
| Diplomatic Watch | Photo Gallery | Administrative/Gallery content |
| Diplomatic Watch | Look Your Best With Jane Pennewell | Specific column content |
| Echo Media | Media Network | Administrative content |
| International Spectrum | Uncategorized | Default WordPress category |

---

## Remote Categories Reference (Full Dump)

### Diplomatic Watch (26 categories)

| ID | Name | Slug | Parent | Count | Link |
|----|------|------|--------|-------|------|
| 325 | Africa | africa | 324 (Regions) | 88 | https://diplomaticwatch.com/regions/africa/ |
| 328 | Americas | americas | 324 (Regions) | 96 | https://diplomaticwatch.com/regions/americas/ |
| 297 | Appointments | appointments | 61 (Diplomacy) | 39 | https://diplomaticwatch.com/diplomacy/appointments/ |
| 326 | Asia | asia | 324 (Regions) | 133 | https://diplomaticwatch.com/regions/asia/ |
| 57 | Business & Investment | business | 0 | 155 | https://diplomaticwatch.com/business/ |
| 4231 | Cultural Connections | cultural-connections | 66 (Culture & Tourism) | 5 | https://diplomaticwatch.com/culture-tourism/cultural-connections/ |
| 66 | Culture & Tourism | culture-tourism | 0 | 155 | https://diplomaticwatch.com/culture-tourism/ |
| 61 | Diplomacy | diplomacy | 0 | 1215 | https://diplomaticwatch.com/diplomacy/ |
| 60 | Economy | economy | 0 | 108 | https://diplomaticwatch.com/economy/ |
| 1505 | Editorial | editorial | 0 | 8 | https://diplomaticwatch.com/editorial/ |
| 327 | Europe | europe | 324 (Regions) | 97 | https://diplomaticwatch.com/regions/europe/ |
| 331 | Events | events | 0 | 210 | https://diplomaticwatch.com/events/ |
| 96 | Fashion & Lifestyle | fashion_lifestyle | 1 (News Update) | 16 | https://diplomaticwatch.com/news-update/fashion_lifestyle/ |
| 35 | Health | health | 1 (News Update) | 13 | https://diplomaticwatch.com/news-update/health/ |
| 58 | Interview | interview | 0 | 77 | https://diplomaticwatch.com/interview/ |
| 4150 | Know Your President | know-your-president | 0 | 4 | https://diplomaticwatch.com/know-your-president/ |
| 2956 | Look Your Best With Jane Pennewell | look-your-best-with-jane-pennewell | 96 (Fashion) | 9 | https://diplomaticwatch.com/.../look-your-best-with-jane-pennewell/ |
| 749 | Middle East | middle-east | 324 (Regions) | 29 | https://diplomaticwatch.com/regions/middle-east/ |
| 1 | News Update | news-update | 0 | 337 | https://diplomaticwatch.com/news-update/ |
| 329 | Oceania | oceania | 324 (Regions) | 24 | https://diplomaticwatch.com/regions/oceania/ |
| 67 | Opinion | opinion | 0 | 61 | https://diplomaticwatch.com/opinion/ |
| 63 | Photo Gallery | photo_gallery | 0 | 12 | https://diplomaticwatch.com/photo_gallery/ |
| 313 | Politics & Policy | politics-policy | 0 | 122 | https://diplomaticwatch.com/politics-policy/ |
| 324 | Regions | regions | 0 | 5 | https://diplomaticwatch.com/regions/ |
| 31 | Sports | sports | 1 (News Update) | 23 | https://diplomaticwatch.com/news-update/sports/ |
| 40 | Technology | tech | 1 (News Update) | 59 | https://diplomaticwatch.com/news-update/tech/ |

---

### Echo Media (4 categories)

| ID | Name | Slug | Parent | Count | Link |
|----|------|------|--------|-------|------|
| 3 | Art & Culture | artculture | 0 | 7 | https://www.echo-media.info/blog/category/artculture/ |
| 6 | Education | education | 0 | 4 | https://www.echo-media.info/blog/category/education/ |
| 19 | Media Network | media-network | 0 | 0 | https://www.echo-media.info/blog/category/media-network/ |
| 1 | Nature | nature | 0 | 2 | https://www.echo-media.info/blog/category/nature/ |

---

### International Spectrum (7 categories)

| ID | Name | Slug | Parent | Count | Link |
|----|------|------|--------|-------|------|
| 108 | Arts | arts | 0 | 3 | https://www.internationalspectrum.org/category/arts/ |
| 102 | Civic & Cultural Affairs | civicandculturalaffairs | 0 | 9 | https://www.internationalspectrum.org/category/civicandculturalaffairs/ |
| 105 | Community & Public Programs | communitypublicprograms | 0 | 12 | https://www.internationalspectrum.org/category/communitypublicprograms/ |
| 101 | History & Legacy | historylegacy | 0 | 5 | https://www.internationalspectrum.org/category/historylegacy/ |
| 103 | Leadership & Youth Engagement | leadershipyouthengagement | 0 | 1 | https://www.internationalspectrum.org/category/leadershipyouthengagement/ |
| 104 | Social Impact & Justice | socialimpactjustice | 0 | 3 | https://www.internationalspectrum.org/category/socialimpactjustice/ |
| 1 | Uncategorized | uncategorized | 0 | 0 | https://www.internationalspectrum.org/category/uncategorized/ |

---

## Implementation Details

### Files Involved

**Category Mapping Logic:**
- `includes/mapping.php` — Contains all mapping functions and data
  - `um_category_parents()` — Parent category definitions
  - `um_category_children_spec()` — Child category definitions
  - `um_source_category_map()` — Remote → unified mapping
  - `um_excluded_source_categories()` — Exclusion rules
  - `um_resolve_categories($site_id, $category_names)` — Resolution function

**Taxonomy Registration:**
- `includes/storage.php` — Will register `um_category` taxonomy (Priority 1 task)

**Category Extraction:**
- `includes/normalize.php` — Will extract categories from `_embedded` (Priority 1 task)

**Category Assignment:**
- `includes/storage.php` — Will assign categories during `um_upsert_article()` (Priority 2 task)

---

## Mapping Process Flow

```
1. Fetch remote post with ?_embed=1
   ↓
2. Extract categories from _embedded['wp:term'] (where taxonomy='category')
   → Function: um_extract_remote_categories($remote_post)
   → Returns: ['Economy', 'Business & Investment']
   ↓
3. Resolve categories
   → Function: um_resolve_categories('diplomaticwatch', ['Economy', 'Business & Investment'])
   → Returns:
     {
       'mapped_slugs': ['dw-economy', 'dw-business-investment'],
       'unmapped': [],
       'is_excluded': false,
       'excluded_reason': ''
     }
   ↓
4. Assign to post
   → wp_set_object_terms($post_id, ['dw-economy', 'dw-business-investment'], 'um_category')
   ↓
5. If is_excluded = true
   → update_post_meta($post_id, 'um_is_excluded', 1)
   → update_post_meta($post_id, 'um_excluded_reason', $reason)
```

---

## Unmapped Category Tracking

If a remote category is encountered that has no mapping:
- It's added to the `um_unmapped_categories` option
- Format: `{site_id}|{category_slug} => {count, last_seen}`
- Admin panel displays all unmapped categories for review
- Allows humans to update `mapping.php` as remote sites evolve

---

## REST API Category Filtering

Once categories are implemented, the REST API will support:

```
GET /wp-json/um/v1/articles?category=world-news-politics
GET /wp-json/um/v1/articles?category=dw-africa
GET /wp-json/um/v1/articles?category=art-culture,economy-business (multiple)
```

**Query behavior:**
- Parent slug: returns all articles in any child category
- Child slug: returns only articles in that specific child
- Multiple: OR logic (articles matching any category)
- Default: excludes `um_is_excluded = 1` articles
- `?include_excluded=1` — shows excluded articles (debugging)

---

## Search Integration

Once categories are assigned:
- Basic search: title + excerpt (current)
- Enhanced search: title + excerpt + category names
- Future: Full-text content search

Category names will be searchable via taxonomy join queries in the REST API endpoint.

---

## Next Steps (Implementation)

See **STORAGE-REQUIREMENTS.md** and **CLAUDE.md** for full implementation plan.

**Priority 1 Tasks:**
1. Register `um_category` taxonomy (hierarchical, REST-enabled)
2. Create activation hook to auto-create all terms
3. Extract categories from remote `_embedded` data
4. Map categories via `um_resolve_categories()`
5. Assign categories during ingestion
6. Track unmapped categories
7. Add admin UI panel for unmapped categories

---

## Category Statistics

**Coverage:**
- Diplomatic Watch: 26 categories → 22 mapped + 2 excluded = 24/26 covered
  - **Unmapped:** None (all accounted for)
- Echo Media: 4 categories → 3 mapped + 1 excluded = 4/4 covered ✅
- International Spectrum: 7 categories → 6 mapped + 1 excluded = 7/7 covered ✅

**Total Coverage:** 37/37 categories accounted for (100% ✅)

---

## Notes

- Categories use `&amp;` in HTML-encoded form from WordPress REST API
- Normalize category names before comparison (see `um_normalize_name()`)
- Parent categories are for organization only — all content is tagged with child categories
- Child categories retain source site prefix for clarity (e.g., `dw-`, `em-`, `is-`)
- Exclusion is opt-in: articles with excluded categories are ingested but flagged
- Frontend can choose to filter out excluded articles or show them with a badge
