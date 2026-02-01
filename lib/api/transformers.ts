import type { ApiArticle } from "./types";
import type {
  FeaturedArticle,
  SecondaryArticle,
  Type4Article,
  SectionData,
  SectionType4Data,
} from "@/lib/dummyData";

/**
 * Format read time as display string
 */
function formatReadTime(minutes: number): string {
  return `${minutes} min read`;
}

/**
 * Get gallery images from article
 * Returns array if multiple images, single string if one, or placeholder
 */
function getGalleryImages(article: ApiArticle): string | string[] {
  // Use images array if available and has content
  if (article.images && article.images.length > 0) {
    // Return array for galleries, single string for single image
    return article.images.length > 1 ? article.images : article.images[0];
  }
  // Fall back to featured_image
  if (article.featured_image) {
    return article.featured_image;
  }
  // Last resort placeholder
  return "/placeholder.jpg";
}

/**
 * Transform API article to featured article format
 */
export function toFeaturedArticle(article: ApiArticle): FeaturedArticle {
  return {
    title: article.title,
    snippet: article.excerpt,
    time: formatReadTime(article.read_time_minutes),
    gallery: getGalleryImages(article),
    url: article.source_url,
  };
}

/**
 * Transform API article to secondary article format
 */
export function toSecondaryArticle(article: ApiArticle): SecondaryArticle {
  return {
    title: article.title,
    time: formatReadTime(article.read_time_minutes),
    url: article.source_url,
  };
}

/**
 * Transform API article to Type4 article format
 */
export function toType4Article(
  article: ApiArticle,
  includeImage = true
): Type4Article {
  // For Type4, use first image from array or featured_image
  const firstImage =
    article.images?.[0] || article.featured_image || undefined;

  return {
    title: article.title,
    time: formatReadTime(article.read_time_minutes),
    image: includeImage ? firstImage : undefined,
    url: article.source_url,
  };
}

/**
 * Transform articles for SectionType1/2 (featured + 4 secondary)
 */
export function toSectionData(articles: ApiArticle[]): SectionData {
  const [featured, ...rest] = articles;

  return {
    featured: toFeaturedArticle(featured),
    secondary: rest.slice(0, 4).map(toSecondaryArticle),
  };
}

/**
 * Transform articles for SectionType3 (featured + 3 secondary)
 */
export function toSectionType3Data(articles: ApiArticle[]): SectionData {
  const [featured, ...rest] = articles;

  return {
    featured: toFeaturedArticle(featured),
    secondary: rest.slice(0, 3).map(toSecondaryArticle),
  };
}

/**
 * Transform articles for SectionType4 (4 equal articles)
 */
export function toSectionType4Data(
  articles: ApiArticle[],
  textOnly = false
): SectionType4Data {
  return {
    articles: articles
      .slice(0, 4)
      .map((article) => toType4Article(article, !textOnly)),
  };
}
