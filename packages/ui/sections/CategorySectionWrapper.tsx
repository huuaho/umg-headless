"use client";

import { useEffect, useMemo, useState } from "react";
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
  const needed = ARTICLES_NEEDED[sectionType];
  const [fetchCount, setFetchCount] = useState(() =>
    priority !== undefined ? needed * 2 : needed
  );

  const { articles, isLoading, error, refetch } = useArticles({
    category: slug,
    count: fetchCount,
  });

  const seen = useSeenArticles();

  // Filter out articles claimed by higher-priority sections, then trim to needed count
  const filteredArticles = useMemo(() => {
    if (!seen || priority === undefined) return articles.slice(0, needed);
    return seen.filter(articles, priority).slice(0, needed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen?.version, articles, priority, needed]);

  // Claim only the articles we're actually showing
  useEffect(() => {
    if (seen && priority !== undefined && filteredArticles.length > 0) {
      seen.claim(
        filteredArticles.map((a) => a.id),
        priority
      );
    }
  }, [seen, filteredArticles, priority]);

  // If we don't have enough after dedup, fetch more (if the category has more)
  useEffect(() => {
    if (
      seen &&
      priority !== undefined &&
      !isLoading &&
      filteredArticles.length < needed &&
      articles.length >= fetchCount
    ) {
      setFetchCount((prev) => prev + needed);
    }
  }, [seen, priority, isLoading, filteredArticles.length, needed, articles.length, fetchCount]);

  // Loading state (only on initial load, not re-fetches for backfill)
  if (isLoading && articles.length === 0) {
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
