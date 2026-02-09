import type {
  WpPost,
  ApiArticle,
  ApiCategory,
  ArticlesResponse,
  FetchArticlesOptions,
  SearchArticlesOptions,
} from "./types";
import { processContent, toFullSizeUrl } from "./content";

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
 * Resolve WP media IDs to source URLs via the media API.
 * Fetches in a single batch request.
 */
async function resolveMediaIds(ids: number[]): Promise<string[]> {
  if (ids.length === 0) return [];

  const params = new URLSearchParams({
    include: ids.join(","),
    per_page: String(ids.length),
    _fields: "id,source_url",
  });

  const url = `${API_BASE_URL}/wp/v2/media?${params}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) return [];

  const media: Array<{ id: number; source_url: string }> =
    await response.json();

  // Return full-size URLs in the same order as the input IDs
  const urlMap = new Map(media.map((m) => [m.id, toFullSizeUrl(m.source_url)]));
  return ids.map((id) => urlMap.get(id)).filter(Boolean) as string[];
}

/**
 * Convert a standard WP REST API post to the ApiArticle format.
 * Async because it resolves gallery media IDs via the WP media API.
 */
async function wpPostToApiArticle(post: WpPost): Promise<ApiArticle> {
  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  const rawFeaturedImage = featuredMedia?.source_url || null;
  const featuredImage = rawFeaturedImage ? toFullSizeUrl(rawFeaturedImage) : null;
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

  // Process content: strip Divi shortcodes, extract images + gallery IDs
  const processed = processContent(post.content.rendered);

  // Resolve gallery media IDs to URLs
  const galleryUrls = await resolveMediaIds(processed.galleryIds);

  // Combine all images, deduplicated
  const imageSet = new Set<string>();
  if (featuredImage) imageSet.add(featuredImage);
  for (const img of processed.images) imageSet.add(img);
  for (const img of galleryUrls) imageSet.add(img);
  const allImages = Array.from(imageSet);

  return {
    id: post.id,
    title: stripHtml(post.title.rendered),
    slug: post.slug,
    date: post.date,
    source: "wp",
    source_label: "WordPress",
    source_url: post.link,
    excerpt: stripHtml(post.excerpt.rendered),
    content: processed.html,
    featured_image: featuredImage,
    images: allImages,
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
    items: await Promise.all(posts.map(wpPostToApiArticle)),
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
    items: await Promise.all(posts.map(wpPostToApiArticle)),
  };
}

/**
 * Fetch a single article by slug from WP REST API
 */
export async function fetchArticleBySlugWP(
  slug: string
): Promise<ApiArticle | null> {
  const params = new URLSearchParams({
    slug,
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
  if (posts.length === 0) return null;

  return wpPostToApiArticle(posts[0]);
}

/**
 * Fetch all post slugs from WP REST API (paginated)
 */
export async function fetchAllSlugsWP(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;

  while (true) {
    const params = new URLSearchParams({
      per_page: "100",
      page: String(page),
      _fields: "slug",
    });

    const url = `${API_BASE_URL}/wp/v2/posts?${params}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      if (response.status === 400) break; // Past last page
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const posts: Array<{ slug: string }> = await response.json();
    if (posts.length === 0) break;

    slugs.push(...posts.map((p) => p.slug));

    const totalPages = parseInt(
      response.headers.get("X-WP-TotalPages") || "1",
      10
    );
    if (page >= totalPages) break;
    page++;
  }

  return slugs;
}
