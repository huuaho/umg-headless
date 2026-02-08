import type {
  WpPost,
  ApiArticle,
  ApiCategory,
  ArticlesResponse,
  FetchArticlesOptions,
  SearchArticlesOptions,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://your-wordpress-site.com/wp-json";

/**
 * Cache for category slug → WP category ID mapping
 */
const categoryIdCache = new Map<string, number>();

/**
 * Look up a WP category ID by slug. Results are cached.
 */
async function getCategoryId(slug: string): Promise<number | null> {
  if (categoryIdCache.has(slug)) {
    return categoryIdCache.get(slug)!;
  }

  const url = `${API_BASE_URL}/wp/v2/categories?slug=${encodeURIComponent(slug)}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Category lookup failed: ${response.status}`);
  }

  const categories = await response.json();
  if (categories.length === 0) {
    return null;
  }

  const id = categories[0].id;
  categoryIdCache.set(slug, id);
  return id;
}

/**
 * Strip HTML tags and decode common HTML entities
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&hellip;|&#8230;/g, "\u2026")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#8211;/g, "\u2013")
    .replace(/&#8212;/g, "\u2014")
    .trim();
}

/**
 * Estimate read time from content (rough: ~200 words/min, ~5 chars/word)
 */
function estimateReadTime(content: string): number {
  const wordCount = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / 200));
}

/**
 * Convert a standard WP REST API post to the ApiArticle format
 */
function wpPostToApiArticle(post: WpPost): ApiArticle {
  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  const featuredImage = featuredMedia?.source_url || null;
  const authorName = post._embedded?.author?.[0]?.name || "Unknown";

  // Get category info from embedded terms
  const wpCategories = post._embedded?.["wp:term"]?.[0] || [];
  const apiCategories: ApiCategory[] = wpCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    parent: 0,
  }));

  const categoryName = apiCategories[0]?.name || "";

  return {
    id: post.id,
    title: stripHtml(post.title.rendered),
    date: post.date,
    source: "wp",
    source_label: "WordPress",
    source_url: post.link,
    excerpt: stripHtml(post.excerpt.rendered),
    featured_image: featuredImage,
    images: featuredImage ? [featuredImage] : [],
    author_name: authorName,
    category: categoryName,
    categories: apiCategories,
    read_time_minutes: estimateReadTime(post.content.rendered),
    is_excluded: false,
  };
}

/**
 * Fetch articles from standard WP REST API (wp/v2/posts)
 */
export async function fetchArticlesWP(
  options: FetchArticlesOptions
): Promise<ArticlesResponse> {
  const { category, perPage = 5, page = 1 } = options;

  // Resolve category slug to WP category ID
  const categoryId = await getCategoryId(category);
  if (categoryId === null) {
    return { page, per_page: perPage, total: 0, total_pages: 0, items: [] };
  }

  const params = new URLSearchParams({
    categories: String(categoryId),
    per_page: String(perPage),
    page: String(page),
    _embed: "true",
  });

  const url = `${API_BASE_URL}/wp/v2/posts?${params}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const posts: WpPost[] = await response.json();
  const total = parseInt(response.headers.get("X-WP-Total") || "0", 10);
  const totalPages = parseInt(
    response.headers.get("X-WP-TotalPages") || "0",
    10
  );

  return {
    page,
    per_page: perPage,
    total,
    total_pages: totalPages,
    items: posts.map(wpPostToApiArticle),
  };
}

/**
 * Search articles from standard WP REST API (wp/v2/posts)
 */
export async function searchArticlesWP(
  options: SearchArticlesOptions
): Promise<ArticlesResponse> {
  const { search, category, perPage = 20, page = 1 } = options;

  const params = new URLSearchParams({
    search,
    per_page: String(perPage),
    page: String(page),
    _embed: "true",
  });

  // Optionally filter by category
  if (category) {
    const categoryId = await getCategoryId(category);
    if (categoryId !== null) {
      params.set("categories", String(categoryId));
    }
  }

  const url = `${API_BASE_URL}/wp/v2/posts?${params}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const posts: WpPost[] = await response.json();
  const total = parseInt(response.headers.get("X-WP-Total") || "0", 10);
  const totalPages = parseInt(
    response.headers.get("X-WP-TotalPages") || "0",
    10
  );

  return {
    page,
    per_page: perPage,
    total,
    total_pages: totalPages,
    items: posts.map(wpPostToApiArticle),
  };
}
