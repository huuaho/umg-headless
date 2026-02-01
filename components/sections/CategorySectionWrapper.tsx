"use client";

import { useArticles } from "@/hooks/useArticles";
import {
  toSectionData,
  toSectionType3Data,
  toSectionType4Data,
} from "@/lib/api/transformers";
import SectionType1 from "./SectionType1";
import SectionType2 from "./SectionType2";
import SectionType3 from "./SectionType3";
import SectionType4 from "./SectionType4";
import SectionSkeleton from "./SectionSkeleton";
import SectionError from "./SectionError";

export type SectionType = "type1" | "type2" | "type3" | "type4" | "type4-text";

interface CategorySectionWrapperProps {
  slug: string;
  category: string;
  sectionType: SectionType;
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
}: CategorySectionWrapperProps) {
  const { articles, isLoading, error, refetch } = useArticles({
    category: slug,
    count: ARTICLES_NEEDED[sectionType],
  });

  // Loading state
  if (isLoading) {
    return <SectionSkeleton slug={slug} category={category} />;
  }

  // Error state
  if (error || articles.length === 0) {
    return (
      <SectionError
        slug={slug}
        category={category}
        message={error?.message || "No articles found"}
        onRetry={refetch}
      />
    );
  }

  // Render appropriate section type
  switch (sectionType) {
    case "type1": {
      const data = toSectionData(articles);
      return (
        <SectionType1
          slug={slug}
          category={category}
          featured={data.featured}
          secondary={data.secondary}
        />
      );
    }
    case "type2": {
      const data = toSectionData(articles);
      return (
        <SectionType2
          slug={slug}
          category={category}
          featured={data.featured}
          secondary={data.secondary}
        />
      );
    }
    case "type3": {
      const data = toSectionType3Data(articles);
      return (
        <SectionType3
          slug={slug}
          category={category}
          featured={data.featured}
          secondary={data.secondary}
        />
      );
    }
    case "type4": {
      const data = toSectionType4Data(articles, false);
      return (
        <SectionType4
          slug={slug}
          category={category}
          articles={data.articles}
        />
      );
    }
    case "type4-text": {
      const data = toSectionType4Data(articles, true);
      return (
        <SectionType4
          slug={slug}
          category={category}
          articles={data.articles}
          textOnly
        />
      );
    }
  }
}
