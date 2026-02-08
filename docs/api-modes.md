# API Modes: Custom vs Standard WP REST

The monorepo supports two WordPress API backends via the `NEXT_PUBLIC_API_MODE` environment variable.

## Overview

| Site | API Mode | Endpoint | Article Model |
|------|----------|----------|---------------|
| **UMG** | `custom` (default) | `um/v1/articles` | External links to source sites |
| **Echo Media** | `wp` | `wp/v2/posts` | Internal articles on echo-media.info |
| **International Spectrum** | `wp` | `wp/v2/posts` | Internal articles on internationalspectrum.org |

UMG runs a custom WordPress plugin (**United Media Ingestor**) that aggregates articles from multiple sources into a unified API. See [wordpress-api.md](wordpress-api.md) for full documentation.

Echo Media and International Spectrum are standalone WordPress sites with their own content. They use the standard WP REST API (`wp/v2/posts`), which the `@umg/api` package adapts into the same `ApiArticle` format so the shared UI components work with both.

---

## Configuration

Each app sets its API mode in `.env.local`:

```bash
# UMG (default — no NEXT_PUBLIC_API_MODE needed)
NEXT_PUBLIC_WP_API_URL=https://www.api.unitedmediadc.com/wp-json

# Echo Media
NEXT_PUBLIC_WP_API_URL=https://www.echo-media.info/wp-json
NEXT_PUBLIC_API_MODE=wp

# International Spectrum
NEXT_PUBLIC_WP_API_URL=https://www.internationalspectrum.org/wp-json
NEXT_PUBLIC_API_MODE=wp
```

---

## API Response Differences

| Field | UMG (`um/v1/articles`) | EM/IS (`wp/v2/posts?_embed`) |
|-------|------------------------|------------------------------|
| Filter by category | `?category=slug` | `?categories=ID` (slug→ID lookup via `/wp/v2/categories?slug=X`) |
| Title | `title` (plain string) | `title.rendered` (may contain HTML entities) |
| Excerpt | `excerpt` (plain string) | `excerpt.rendered` (HTML with `<p>` tags) |
| Featured image | `featured_image` (direct URL) | `_embedded['wp:featuredmedia'][0].source_url` |
| Multiple images | `images[]` (array of URLs) | Not available from standard API |
| Author | `author_name` (string) | `_embedded.author[0].name` |
| Read time | `read_time_minutes` (calculated) | Not available (estimated from content) |
| Article URL | `source_url` (external link) | `link` (WP permalink) |
| Response shape | `{ items: [], total, page, per_page, total_pages }` | Array of posts + `X-WP-Total` / `X-WP-TotalPages` headers |

---

## How the Adapter Works

The `@umg/api` package (`packages/api/`) handles this transparently:

1. `client.ts` checks `NEXT_PUBLIC_API_MODE` at the top
2. When `"wp"`, `fetchArticles()` and `searchArticles()` delegate to `wp-client.ts`
3. `wp-client.ts` fetches from `wp/v2/posts?_embed`, then converts each WP post into the `ApiArticle` format
4. Downstream code (transformers, hooks, UI components) works identically regardless of mode

```
fetchArticles(category, perPage)
  ├── API_MODE = "custom" → GET /um/v1/articles?category=slug
  └── API_MODE = "wp"     → GET /wp/v2/categories?slug=X → ID
                           → GET /wp/v2/posts?categories=ID&_embed
                           → Convert WpPost[] to ApiArticle[]
```

---

## Echo Media WordPress Categories

| Name | Slug | WP Category ID |
|------|------|----------------|
| Art & Culture | `artculture` | 3 |
| Education | `education` | 6 |
| Environment | `environment` | 1 |

---

## Key Difference: Article Links

- **UMG**: Articles link externally (`target="_blank"` to `source_url` on the original site)
- **EM/IS**: Articles are hosted internally — links point to the site's own pages

Currently the section components use `<a target="_blank">` for all article links. For EM/IS, articles link to the WordPress permalink for now. A future update will create internal article detail pages (`/articles/[slug]`) and update section components accordingly.
