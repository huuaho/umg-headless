import type {
  WpPost,
  WpComment,
  CreateCommentPayload,
  ApiArticle,
  ApiCategory,
  ArticlesResponse,
  FetchArticlesOptions,
  SearchArticlesOptions,
} from "./types";
import type { ContentBlock } from "./content";
import { parseContentBlocks, processContent, toFullSizeUrl } from "./content";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://your-wordpress-site.com/wp-json";

async function parseJsonResponse<T>(response: Response, url: string): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const body = (await response.text()).slice(0, 200);
    throw new Error(
      `Expected JSON from ${url} but got ${contentType}: ${body}`
    );
  }
  return response.json();
}

/** Backoff between bot-challenge retries. Four attempts total. */
const CHALLENGE_RETRY_DELAYS_MS = [1000, 3000, 8000];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * SiteGround's bot protection answers with an HTML CAPTCHA interstitial
 * (`/.well-known/sgcaptcha/...`) instead of JSON when it doesn't like the
 * caller's IP. CI hits this regularly — the builds run from GitHub runner IPs
 * and the whole site build dies on the first challenged request.
 */
function isBotChallenge(body: string): boolean {
  return /sgcaptcha|\/\.well-known\//i.test(body);
}

/**
 * GET a WP REST endpoint, retrying through SiteGround bot challenges.
 *
 * Returns the raw Response so callers keep their own status handling — one of
 * them reads pagination headers, another treats 400 as "past the last page".
 * A challenge arrives as a **200 with an HTML body**, so it cannot be detected
 * from the status code; only the body is consumed on the non-JSON path, which
 * leaves the JSON path's body intact for the caller to read.
 */
async function fetchWpGet(url: string): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return response;

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return response;

    const body = (await response.text()).slice(0, 200);
    if (!isBotChallenge(body) || attempt >= CHALLENGE_RETRY_DELAYS_MS.length) {
      throw new Error(
        `Expected JSON from ${url} but got ${contentType}: ${body}`
      );
    }

    await sleep(CHALLENGE_RETRY_DELAYS_MS[attempt]);
  }
}

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
  const response = await fetchWpGet(url);

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
 * Strip WordPress auto-generated "Continue reading 'Title'" suffix from excerpts.
 * WP adds this when no manual excerpt is set; stripHtml() preserves the text.
 */
function stripContinueReading(text: string): string {
  return text.replace(/\s*\u2026?\s*Continue reading\s*.+$/i, "").trim();
}

/**
 * Estimate read time from content (rough: ~200 words/min, ~5 chars/word)
 */
function estimateReadTime(content: string): number {
  const wordCount = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / 200));
}

/**
 * Resolve WP media IDs to full-size source URLs via the media API.
 * Fetches in a single batch request. Returns a lookup so callers can map
 * URLs back onto the gallery block each ID came from.
 */
async function resolveMediaMap(ids: number[]): Promise<Map<number, string>> {
  if (ids.length === 0) return new Map();

  const params = new URLSearchParams({
    include: ids.join(","),
    per_page: String(ids.length),
    _fields: "id,source_url",
  });

  const url = `${API_BASE_URL}/wp/v2/media?${params}`;
  const response = await fetchWpGet(url);

  if (!response.ok) return new Map();

  const media: Array<{ id: number; source_url: string }> =
    await response.json();

  return new Map(media.map((m) => [m.id, toFullSizeUrl(m.source_url)]));
}

/**
 * Build the ordered body blocks for an article.
 *
 * Divi galleries come out of the parser with IDs only, so they are filled in
 * from the already-fetched media map. The featured image is prepended as the
 * hero and then removed from the body wherever it reappears — 44 of 198 posts
 * repeat it, and a carousel opens on its first slide, so leaving it in a
 * gallery renders the same photo twice, stacked under the hero.
 */
function buildContentBlocks(
  rawHtml: string,
  featuredImage: string | null,
  mediaMap: Map<number, string>,
  hasVideo: boolean
): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  // Video posts keep the YouTube embed as their hero, so nothing is deduped
  const heroImage = hasVideo ? null : featuredImage;

  for (const block of parseContentBlocks(rawHtml)) {
    if (block.type === "gallery") {
      const resolved = block.ids
        ? (block.ids.map((id) => mediaMap.get(id)).filter(Boolean) as string[])
        : block.images;
      const images = resolved.filter((src) => src !== heroImage);
      if (images.length > 0) blocks.push({ type: "gallery", images });
      continue;
    }

    if (block.type === "image" && block.src === heroImage) continue;

    blocks.push(block);
  }

  if (heroImage) {
    blocks.unshift({ type: "image", src: heroImage });
  }

  return blocks;
}

/**
 * Convert a standard WP REST API post to the ApiArticle format.
 * Async because it resolves gallery media IDs via the WP media API.
 */
async function wpPostToApiArticle(post: WpPost): Promise<ApiArticle> {
  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  const rawFeaturedImage = featuredMedia?.source_url || null;
  const featuredImage = rawFeaturedImage ? toFullSizeUrl(rawFeaturedImage) : null;
  const authorName =
    post.authors?.[0]?.display_name ||
    post._embedded?.author?.[0]?.name ||
    post.author_display_name ||
    "Unknown";

  // Get category info from embedded terms
  const wpCategories = post._embedded?.["wp:term"]?.[0] || [];
  const apiCategories: ApiCategory[] = wpCategories.map((cat) => ({
    id: cat.id,
    name: stripHtml(cat.name),
    slug: cat.slug,
    parent: 0,
  }));

  const categoryName = apiCategories[0]?.name || "";

  // Process content: strip Divi shortcodes, extract images + gallery IDs
  const processed = processContent(post.content.rendered);

  // Resolve gallery media IDs to URLs (one batch request for the whole post)
  const mediaMap = await resolveMediaMap(processed.galleryIds);
  const galleryUrls = processed.galleryIds
    .map((id) => mediaMap.get(id))
    .filter(Boolean) as string[];

  // Combine all images, deduplicated
  const imageSet = new Set<string>();
  if (featuredImage) imageSet.add(featuredImage);
  for (const img of processed.images) imageSet.add(img);
  for (const img of galleryUrls) imageSet.add(img);

  // Use YouTube thumbnail as fallback when no other images exist
  const videoUrl = post.meta?.video_url || "";
  if (imageSet.size === 0 && videoUrl) {
    const ytMatch = videoUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch?.[1]) {
      imageSet.add(`https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`);
    }
  }

  const allImages = Array.from(imageSet);

  return {
    id: post.id,
    title: stripHtml(post.title.rendered),
    slug: post.slug,
    date: post.date,
    source: "wp",
    source_label: "WordPress",
    source_url: post.link,
    excerpt: stripContinueReading(stripHtml(post.excerpt.rendered)),
    content: processed.html,
    blocks: buildContentBlocks(
      post.content.rendered,
      featuredImage,
      mediaMap,
      Boolean(videoUrl)
    ),
    featured_image: featuredImage,
    images: allImages,
    author_name: authorName,
    category: categoryName,
    categories: apiCategories,
    read_time_minutes: estimateReadTime(post.content.rendered),
    is_excluded: false,
    video_url: post.meta?.video_url || undefined,
  };
}

/**
 * Fetch articles from standard WP REST API (wp/v2/posts)
 */
export async function fetchArticlesWP(
  options: FetchArticlesOptions
): Promise<ArticlesResponse> {
  const { category, perPage = 5, page = 1 } = options;

  const params = new URLSearchParams({
    per_page: String(perPage),
    page: String(page),
    _embed: "true",
  });

  // Only filter by category when provided
  if (category) {
    const categoryId = await getCategoryId(category);
    if (categoryId === null) {
      return { page, per_page: perPage, total: 0, total_pages: 0, items: [] };
    }
    params.set("categories", String(categoryId));
  }

  const url = `${API_BASE_URL}/wp/v2/posts?${params}`;
  const response = await fetchWpGet(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const posts: WpPost[] = await parseJsonResponse(response, url);
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
  const response = await fetchWpGet(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const posts: WpPost[] = await parseJsonResponse(response, url);
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
  const response = await fetchWpGet(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const posts: WpPost[] = await parseJsonResponse(response, url);
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
    const response = await fetchWpGet(url);

    if (!response.ok) {
      if (response.status === 400) break; // Past last page
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const posts: Array<{ slug: string }> = await parseJsonResponse(response, url);
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

/**
 * Fetch all approved comments for a post from WP REST API.
 */
export async function fetchCommentsWP(postId: number): Promise<WpComment[]> {
  const params = new URLSearchParams({
    post: String(postId),
    per_page: "100",
    orderby: "date",
    order: "asc",
  });

  const url = `${API_BASE_URL}/wp/v2/comments?${params}`;
  const response = await fetchWpGet(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch comments: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Submit a new comment via WP REST API.
 * Returns the created comment (status may be "hold" if moderation is on).
 */
export async function postCommentWP(
  payload: CreateCommentPayload
): Promise<WpComment> {
  const url = `${API_BASE_URL}/wp/v2/comments`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = `Failed to post comment: ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody.message) {
        errorMessage = errorBody.message;
      }
    } catch {
      // Use generic error message
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
