/**
 * WordPress API Response Types
 * Based on United Media Ingestor plugin REST API
 */

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
}

export interface ApiArticle {
  id: number;
  title: string;
  date: string;
  source: string;
  source_label: string;
  source_url: string;
  excerpt: string;
  featured_image: string | null;
  images: string[]; // All images (featured + gallery + content images)
  author_name: string;
  category: string;
  categories: ApiCategory[];
  read_time_minutes: number;
  is_excluded: boolean;
}

export interface ArticlesResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  items: ApiArticle[];
}

export interface FetchArticlesOptions {
  category: string;
  perPage?: number;
  page?: number;
}

export interface SearchArticlesOptions {
  search: string;
  category?: string;
  perPage?: number;
  page?: number;
}
