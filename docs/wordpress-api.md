# WordPress API Documentation

> **Source Plugin**: United Media Ingestor (v0.8.0)
> **Location**: `/Users/huuho/Downloads/allison/united-media-ingestor/`

The headless frontend consumes data from a WordPress site running the **United Media Ingestor** plugin. This plugin aggregates articles from multiple source sites (Echo Media, International Spectrum, Diplomatic Watch) into a unified local storage with normalized categories.

---

## REST API Endpoint

### GET `/wp-json/um/v1/articles`

Returns paginated articles from the aggregated article store.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | - | Full-text search query (searches title, excerpt, and plaintext content) |
| `source` | string | - | Filter by source site ID (`echo-media`, `internationalspectrum`, `diplomaticwatch`) |
| `category` | string | - | Filter by UM category slug (see Category Taxonomy below) |
| `page` | integer | 1 | Page number for pagination |
| `per_page` | integer | 20 | Items per page (max: 100) |
| `include_excluded` | boolean | false | Include articles marked as excluded |
| `include_content` | boolean | false | Include full plaintext content in response |

#### Response Schema

```typescript
interface ArticlesResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  items: Article[];
}

interface Article {
  id: number;                    // WordPress post ID
  title: string;                 // Article headline
  date: string;                  // ISO 8601 date (from source)
  source: string;                // Source site ID
  source_label: string;          // Human-readable source name
  source_url: string;            // Original article URL (for redirects)
  excerpt: string;               // 30-word excerpt
  featured_image: string | null; // Primary image URL from source
  images: string[];              // All images (featured + gallery + content)
  author_name: string;           // Author display name
  category: string;              // Parent category name (for display)
  categories: Category[];        // Full category array
  read_time_minutes: number;     // Estimated read time (200 wpm)
  is_excluded: boolean;          // Exclusion flag
  content?: string;              // Full plaintext (only with include_content=true)
}

interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;                // 0 if top-level
}
```

#### Example Request

```bash
# Get latest 20 articles in "World News & Politics"
curl "https://yoursite.com/wp-json/um/v1/articles?category=world-news-politics&per_page=20"

# Search for articles
curl "https://yoursite.com/wp-json/um/v1/articles?search=climate&per_page=10"

# Get articles from a specific source
curl "https://yoursite.com/wp-json/um/v1/articles?source=diplomaticwatch&per_page=50"
```

#### Example Response

```json
{
  "page": 1,
  "per_page": 20,
  "total": 1523,
  "total_pages": 77,
  "items": [
    {
      "id": 4521,
      "title": "Global leaders gather for historic climate summit in Geneva",
      "date": "2025-01-30T14:30:00",
      "source": "diplomaticwatch",
      "source_label": "Diplomatic Watch",
      "source_url": "https://diplomaticwatch.com/global-leaders-climate-summit",
      "excerpt": "World leaders from over 150 countries have convened in Geneva for what is being called the most significant climate conference since...",
      "featured_image": "https://diplomaticwatch.com/wp-content/uploads/2025/01/summit.jpg",
      "images": [
        "https://diplomaticwatch.com/wp-content/uploads/2025/01/summit.jpg",
        "https://diplomaticwatch.com/wp-content/uploads/2025/01/delegates.jpg",
        "https://diplomaticwatch.com/wp-content/uploads/2025/01/conference-hall.jpg"
      ],
      "author_name": "John Smith",
      "category": "World News & Politics",
      "categories": [
        {
          "id": 15,
          "name": "Diplomatic Watch: Europe",
          "slug": "dw-europe",
          "parent": 2
        }
      ],
      "read_time_minutes": 8,
      "is_excluded": false
    }
  ]
}
```

---

## Category Taxonomy

Articles are organized into a two-level hierarchy: **Parent Categories** (display buckets) and **Child Categories** (source-specific tags).

### Parent Categories (Display Buckets)

| Slug | Display Name |
|------|--------------|
| `world-news-politics` | World News & Politics |
| `profiles-opinions` | Profiles & Opinions |
| `economy-business` | Economy & Business |
| `diplomacy` | Diplomacy |
| `art-culture` | Art & Culture |
| `education-youth` | Education & Youth |
| `local-community` | Local Community |
| `wellbeing-env-tech` | Wellbeing, Environment, Technology |

### Child Categories by Parent

#### World News & Politics
- `dw-africa`, `dw-americas`, `dw-asia`, `dw-europe`
- `dw-know-your-president`, `dw-middle-east`, `dw-news-update`
- `dw-oceania`, `dw-politics-policy`, `dw-regions`

#### Profiles & Opinions
- `dw-editorial`, `dw-interview`, `dw-opinion`
- `is-history-legacy`

#### Economy & Business
- `dw-economy`, `dw-business-investment`

#### Diplomacy
- `dw-diplomacy`, `dw-appointments`

#### Art & Culture
- `dw-cultural-connections`, `dw-culture-tourism`, `dw-fashion-lifestyle`, `dw-sports`
- `em-art-culture`, `is-arts`, `is-civic-cultural`

#### Education & Youth
- `em-education`, `is-leadership-youth`

#### Local Community
- `dw-events`, `is-social-impact`, `is-community-programs`

#### Wellbeing, Environment, Technology
- `dw-technology`, `em-nature`, `dw-health`

---

## Source Sites

| ID | Label | Base URL |
|----|-------|----------|
| `echo-media` | Echo Media | https://www.echo-media.info |
| `internationalspectrum` | International Spectrum | https://www.internationalspectrum.org |
| `diplomaticwatch` | Diplomatic Watch | https://diplomaticwatch.com |

---

## Data Model (WordPress Storage)

Articles are stored as a custom post type `um_article` with the following meta fields:

| Meta Key | Description |
|----------|-------------|
| `um_source_site` | Source site ID |
| `um_remote_post_id` | Original post ID from source |
| `um_source_url` | Original article URL |
| `um_date_gmt` | Publication date (GMT) |
| `um_date_local` | Publication date (local) |
| `um_source_label` | Human-readable source name |
| `um_featured_image_url` | Featured image URL |
| `um_author_name` | Author display name |
| `um_plaintext` | Full article content as plaintext |
| `um_word_count` | Word count for read time calculation |
| `um_is_excluded` | Exclusion flag (1 = excluded) |
| `um_excluded_reason` | Reason for exclusion |

---

## Search Behavior

The search endpoint performs full-text search across:
1. Article title
2. Article excerpt (stored in `post_content`)
3. Full plaintext content (`um_plaintext` meta)

Results are ordered by publication date (newest first) and exclude articles marked with `um_is_excluded = 1` by default.

---

## WordPress Search Integration

The plugin also intercepts WordPress's native search (`/?s=query`) and:
1. Overrides the search template with `templates/search-results.php`
2. Searches only `um_article` posts
3. Redirects article clicks to the original source URL

---

## Frontend Integration Notes

### Mapping API Response to Section Components

```typescript
// Example: Mapping API response to SectionType1 props
function mapToSectionType1(articles: Article[]): SectionData {
  const [featured, ...rest] = articles;

  return {
    featured: {
      title: featured.title,
      snippet: featured.excerpt,
      time: `${featured.read_time_minutes} min read`,
      gallery: featured.featured_image || 'placeholder.jpg',
    },
    secondary: rest.slice(0, 4).map(article => ({
      title: article.title,
      time: `${article.read_time_minutes} min read`,
    })),
  };
}

// Example: Mapping to SectionType4 props
function mapToSectionType4(articles: Article[]): SectionType4Data {
  return {
    articles: articles.slice(0, 4).map(article => ({
      title: article.title,
      time: `${article.read_time_minutes} min read`,
      image: article.featured_image,
    })),
  };
}
```

### Fetching Articles by Category

```typescript
// Fetch articles for a specific section
async function fetchCategoryArticles(categorySlug: string, count: number = 5) {
  const response = await fetch(
    `${WP_API_BASE}/um/v1/articles?category=${categorySlug}&per_page=${count}`
  );
  const data = await response.json();
  return data.items;
}

// Usage
const worldNewsArticles = await fetchCategoryArticles('world-news-politics', 5);
const diplomacyArticles = await fetchCategoryArticles('diplomacy', 4);
```

---

## Article Links

All article links should redirect to the original source URL (`source_url` field). The headless frontend does not host article content - it only displays article cards that link to the original source.
