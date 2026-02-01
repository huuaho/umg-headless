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
 * Transform API article to featured article format
 */
export function toFeaturedArticle(article: ApiArticle): FeaturedArticle {
  return {
    title: article.title,
    snippet: article.excerpt,
    time: formatReadTime(article.read_time_minutes),
    gallery: article.featured_image || "/placeholder.jpg",
  };
}

/**
 * Transform API article to secondary article format
 */
export function toSecondaryArticle(article: ApiArticle): SecondaryArticle {
  return {
    title: article.title,
    time: formatReadTime(article.read_time_minutes),
  };
}

/**
 * Transform API article to Type4 article format
 */
export function toType4Article(
  article: ApiArticle,
  includeImage = true
): Type4Article {
  return {
    title: article.title,
    time: formatReadTime(article.read_time_minutes),
    image: includeImage ? article.featured_image || undefined : undefined,
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
