import type { ApiArticle } from "./types";
import type {
  FeaturedArticle,
  SecondaryArticle,
  Type4Article,
  SectionData,
  SectionType4Data,
} from "@/lib/dummyData";

/**
 * Decode common HTML entities to their character equivalents
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&hellip;/g, "\u2026")
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
    .replace(/&#8212;/g, "\u2014");
}

/**
 * Format read time as display string
 */
function formatReadTime(minutes: number): string {
  return `${minutes} min read`;
}

/**
 * Check if an article has at least one image
 */
function hasImages(article: ApiArticle): boolean {
  return (
    (article.images && article.images.length > 0) ||
    Boolean(article.featured_image)
  );
}

/**
 * Reorder articles so the first article with images becomes featured.
 * If the first article already has images, return as-is.
 * If no articles have images, return as-is.
 */
function ensureFeaturedHasImage(articles: ApiArticle[]): ApiArticle[] {
  if (articles.length === 0) return articles;

  // If first article already has images, no need to swap
  if (hasImages(articles[0])) return articles;

  // Find the first article with images
  const indexWithImage = articles.findIndex(hasImages);

  // If no article has images, return as-is
  if (indexWithImage === -1) return articles;

  // Swap: move the article with images to the front
  const reordered = [...articles];
  const [articleWithImage] = reordered.splice(indexWithImage, 1);
  reordered.unshift(articleWithImage);

  return reordered;
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
    title: decodeHtmlEntities(article.title),
    snippet: decodeHtmlEntities(article.excerpt),
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
    title: decodeHtmlEntities(article.title),
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
    title: decodeHtmlEntities(article.title),
    time: formatReadTime(article.read_time_minutes),
    image: includeImage ? firstImage : undefined,
    url: article.source_url,
  };
}

/**
 * Transform articles for SectionType1/2 (featured + 4 secondary)
 */
export function toSectionData(articles: ApiArticle[]): SectionData {
  // Ensure featured article has an image
  const reordered = ensureFeaturedHasImage(articles);
  const [featured, ...rest] = reordered;

  return {
    featured: toFeaturedArticle(featured),
    secondary: rest.slice(0, 4).map(toSecondaryArticle),
  };
}

/**
 * Transform articles for SectionType3 (featured + 3 secondary)
 */
export function toSectionType3Data(articles: ApiArticle[]): SectionData {
  // Ensure featured article has an image
  const reordered = ensureFeaturedHasImage(articles);
  const [featured, ...rest] = reordered;

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
