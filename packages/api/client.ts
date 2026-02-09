import type {
  ApiArticle,
  WpComment,
  CreateCommentPayload,
  ArticlesResponse,
  FetchArticlesOptions,
  SearchArticlesOptions,
} from "./types";
import {
  fetchArticlesWP,
  searchArticlesWP,
  fetchArticleBySlugWP,
  fetchAllSlugsWP,
  fetchCommentsWP,
  postCommentWP,
} from "./wp-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://your-wordpress-site.com/wp-json";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "custom";

/**
 * Source site IDs → their headless frontend base URL.
 * Used to build correct /articles/{slug} links for EM/IS articles on UMG.
 */
const SOURCE_FRONTEND: Record<string, string> = {
  "echo-media": "https://www.echo-media.info",
  "internationalspectrum": "https://www.internationalspectrum.org",
};

/**
 * Fallback: extract slug from WP date permalink for articles ingested before
 * the um_remote_slug field was added.
 */
const HEADLESS_DOMAINS: Record<string, string> = {
  "echo-media.info": "https://www.echo-media.info",
  "www.echo-media.info": "https://www.echo-media.info",
  "api.echo-media.info": "https://www.echo-media.info",
  "internationalspectrum.org": "https://www.internationalspectrum.org",
  "www.internationalspectrum.org": "https://www.internationalspectrum.org",
  "api.internationalspectrum.org": "https://www.internationalspectrum.org",
};

function normalizeSourceUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const frontendBase = HEADLESS_DOMAINS[parsed.hostname];
    if (frontendBase) {
      const match = parsed.pathname.match(
        /^\/\d{4}\/\d{2}\/\d{2}\/([^/]+)\/?$/
      );
      if (match) {
        return `${frontendBase}/articles/${match[1]}`;
      }
    }
  } catch {
    // Invalid URL — return as-is
  }
  return url;
}

function normalizeArticleUrls(data: ArticlesResponse): ArticlesResponse {
  data.items = data.items.map((item) => {
    const frontendBase = SOURCE_FRONTEND[item.source];

    if (frontendBase && item.slug) {
      // Use slug directly — most reliable
      return {
        ...item,
        source_url: `${frontendBase}/articles/${item.slug}`,
        slug: "", // clear so ArticleLink uses external URL, not internal route
      };
    }

    // Non-headless sites (DW) or articles without slug: keep original URL, clear slug
    return {
      ...item,
      source_url: normalizeSourceUrl(item.source_url),
      slug: "", // UMG has no article pages — all links are external
    };
  });
  return data;
}

/**
 * Fetch articles from WordPress API
 * Delegates to standard WP REST API when API_MODE is "wp"
 */
export async function fetchArticles(
  options: FetchArticlesOptions
): Promise<ArticlesResponse> {
  if (API_MODE === "wp") {
    return fetchArticlesWP(options);
  }

  const { category, perPage = 5, page = 1 } = options;

  const params = new URLSearchParams({
    per_page: String(perPage),
    page: String(page),
  });

  if (category) {
    params.set("category", category);
  }

  const url = `${API_BASE_URL}/um/v1/articles?${params}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return normalizeArticleUrls(await response.json());
}

/**
 * Search articles from WordPress API
 * Delegates to standard WP REST API when API_MODE is "wp"
 */
export async function searchArticles(
  options: SearchArticlesOptions
): Promise<ArticlesResponse> {
  if (API_MODE === "wp") {
    return searchArticlesWP(options);
  }

  const { search, category, perPage = 20, page = 1 } = options;

  const params = new URLSearchParams({
    search,
    per_page: String(perPage),
    page: String(page),
  });

  if (category) {
    params.set("category", category);
  }

  const url = `${API_BASE_URL}/um/v1/articles?${params}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return normalizeArticleUrls(await response.json());
}

/**
 * Fetch a single article by slug
 * Only supported in WP mode (EM/IS). Returns null for custom mode (UMG).
 */
export async function fetchArticleBySlug(
  slug: string
): Promise<ApiArticle | null> {
  if (API_MODE === "wp") {
    return fetchArticleBySlugWP(slug);
  }
  return null;
}

/**
 * Fetch all article slugs for static generation
 * Only supported in WP mode (EM/IS). Returns [] for custom mode (UMG).
 */
export async function fetchAllSlugs(): Promise<string[]> {
  if (API_MODE === "wp") {
    return fetchAllSlugsWP();
  }
  return [];
}

/**
 * Fetch comments for a post.
 * Only supported in WP mode (EM/IS). Returns [] for custom mode (UMG).
 */
export async function fetchComments(postId: number): Promise<WpComment[]> {
  if (API_MODE === "wp") {
    return fetchCommentsWP(postId);
  }
  return [];
}

/**
 * Post a new comment.
 * Only supported in WP mode (EM/IS). Throws in custom mode.
 */
export async function postComment(
  payload: CreateCommentPayload
): Promise<WpComment> {
  if (API_MODE === "wp") {
    return postCommentWP(payload);
  }
  throw new Error("Comments are not supported in custom API mode");
}
