"use client";

import { useEffect, useMemo } from "react";
import {
  useArticles,
  toSectionData,
  toSectionType3Data,
  toSectionType4Data,
} from "@umg/api";
import SectionType1 from "./SectionType1";
import SectionType2 from "./SectionType2";
import SectionType3 from "./SectionType3";
import SectionType4 from "./SectionType4";
import SectionSkeleton from "./SectionSkeleton";
import SectionError from "./SectionError";
import { useSeenArticles } from "../SeenArticlesContext";

export type SectionType = "type1" | "type2" | "type3" | "type4" | "type4-text";

interface CategorySectionWrapperProps {
  slug: string;
  category: string;
  sectionType: SectionType;
  categoryColor?: string;
  categoryTextColor?: string;
  categoryUnderlineColor?: string;
  categoryIcon?: string;
  titleClassName?: string;
  priority?: number;
}

// Articles needed per section type
const ARTICLES_NEEDED: Record<SectionType, number> = {
  type1: 5,
  type2: 5,
  type3: 4,
  type4: 4,
  "type4-text": 4,
};

export default function CategorySectionWrapper({
  slug,
  category,
  sectionType,
  categoryColor,
  categoryTextColor,
  categoryUnderlineColor,
  categoryIcon,
  titleClassName,
  priority,
}: CategorySectionWrapperProps) {
  const { articles, isLoading, error, refetch } = useArticles({
    category: slug,
    count: ARTICLES_NEEDED[sectionType],
  });

  const seen = useSeenArticles();

  // Claim articles for this section's priority
  useEffect(() => {
    if (seen && priority !== undefined && articles.length > 0) {
      seen.claim(
        articles.map((a) => a.id),
        priority
      );
    }
  }, [seen, articles, priority]);

  // Filter out articles claimed by higher-priority sections
  const filteredArticles = useMemo(() => {
    if (!seen || priority === undefined) return articles;
    return seen.filter(articles, priority);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen?.version, articles, priority]);

  // Loading state
  if (isLoading) {
    return <SectionSkeleton slug={slug} category={category} categoryColor={categoryColor} categoryTextColor={categoryTextColor} categoryUnderlineColor={categoryUnderlineColor} categoryIcon={categoryIcon} />;
  }

  // Error state
  if (error || articles.length === 0) {
    return (
      <SectionError
        slug={slug}
        category={category}
        categoryColor={categoryColor}
        categoryIcon={categoryIcon}
        message={error?.message || "No articles found"}
        onRetry={refetch}
      />
    );
  }

  // All articles deduped into earlier sections
  if (filteredArticles.length === 0) {
    return null;
  }

  // Render appropriate section type
  switch (sectionType) {
    case "type1": {
      const data = toSectionData(filteredArticles);
      return (
        <SectionType1
          slug={slug}
          category={category}
          categoryColor={categoryColor}
          categoryTextColor={categoryTextColor}
          categoryUnderlineColor={categoryUnderlineColor}
          categoryIcon={categoryIcon}
          titleClassName={titleClassName}
          featured={data.featured}
          secondary={data.secondary}
        />
      );
    }
    case "type2": {
      const data = toSectionData(filteredArticles);
      return (
        <SectionType2
          slug={slug}
          category={category}
          categoryColor={categoryColor}
          categoryTextColor={categoryTextColor}
          categoryUnderlineColor={categoryUnderlineColor}
          categoryIcon={categoryIcon}
          titleClassName={titleClassName}
          featured={data.featured}
          secondary={data.secondary}
        />
      );
    }
    case "type3": {
      const data = toSectionType3Data(filteredArticles);
      return (
        <SectionType3
          slug={slug}
          category={category}
          categoryColor={categoryColor}
          categoryTextColor={categoryTextColor}
          categoryUnderlineColor={categoryUnderlineColor}
          categoryIcon={categoryIcon}
          titleClassName={titleClassName}
          featured={data.featured}
          secondary={data.secondary}
        />
      );
    }
    case "type4": {
      const data = toSectionType4Data(filteredArticles, false);
      return (
        <SectionType4
          slug={slug}
          category={category}
          categoryColor={categoryColor}
          categoryTextColor={categoryTextColor}
          categoryUnderlineColor={categoryUnderlineColor}
          categoryIcon={categoryIcon}
          titleClassName={titleClassName}
          articles={data.articles}
        />
      );
    }
    case "type4-text": {
      const data = toSectionType4Data(filteredArticles, true);
      return (
        <SectionType4
          slug={slug}
          category={category}
          categoryColor={categoryColor}
          categoryTextColor={categoryTextColor}
          categoryUnderlineColor={categoryUnderlineColor}
          categoryIcon={categoryIcon}
          titleClassName={titleClassName}
          articles={data.articles}
          textOnly
        />
      );
    }
  }
}
