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
    category,
    per_page: String(perPage),
    page: String(page),
  });

  const url = `${API_BASE_URL}/um/v1/articles?${params}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
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

  return response.json();
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
