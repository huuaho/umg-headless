import type {
  ArticlesResponse,
  FetchArticlesOptions,
  SearchArticlesOptions,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://your-wordpress-site.com/wp-json";

/**
 * Fetch articles from WordPress API
 */
export async function fetchArticles(
  options: FetchArticlesOptions
): Promise<ArticlesResponse> {
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
 */
export async function searchArticles(
  options: SearchArticlesOptions
): Promise<ArticlesResponse> {
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
