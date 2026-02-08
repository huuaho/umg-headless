/**
 * WordPress API Response Types
 * Supports two modes:
 * - "custom": United Media Ingestor plugin (um/v1/articles) — used by UMG
 * - "wp": Standard WP REST API (wp/v2/posts) — used by Echo Media, International Spectrum
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

/**
 * Standard WP REST API post type (wp/v2/posts?_embed)
 */
export interface WpPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  link: string;
  featured_media: number;
  categories: number[];
  _embedded?: {
    author?: Array<{ name: string }>;
    "wp:featuredmedia"?: Array<{
      source_url: string;
      media_details?: {
        sizes?: Record<string, { source_url: string; width: number; height: number }>;
      };
    }>;
    "wp:term"?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

/**
 * Transformed article types for UI consumption
 */

export interface FeaturedArticle {
  title: string;
  snippet: string;
  time: string;
  gallery: string | string[]; // Single image or array for gallery carousel
  url: string; // Link to original source
}

export interface SecondaryArticle {
  title: string;
  time: string;
  url: string; // Link to original source
}

export interface Type4Article {
  title: string;
  time: string;
  image?: string; // Optional - only used when textOnly is false
  url: string; // Link to original source
}

export interface SectionType4Data {
  articles: Type4Article[];
}

// All section types share the same data structure
// The display (gallery vs single image) is determined by the gallery value
// Category is passed separately by the page, not included in data
export interface SectionData {
  featured: FeaturedArticle;
  secondary: SecondaryArticle[];
}
