import { categories } from "@/lib/categories";
import {
  CategorySectionWrapper,
  SeenArticlesProvider,
  type SectionType,
} from "@umg/ui";

// Category slug to section type mapping
const SECTION_TYPE_MAP: Record<string, SectionType> = {
  "world-news-politics": "type1",
  "profiles-opinions": "type2",
  "economy-business": "type3",
  diplomacy: "type4",
  "art-culture": "type4",
  "education-youth": "type1",
  "local-community": "type2",
  "wellbeing-env-tech": "type4-text",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white max-w-280 mx-auto px-6 [&>section:last-child]:border-b-0">
      <SeenArticlesProvider>
        {categories.map((category, index) => (
          <CategorySectionWrapper
            key={category.slug}
            slug={category.slug}
            category={category.name}
            sectionType={SECTION_TYPE_MAP[category.slug] || "type1"}
            categoryUnderlineColor="#33bbff"
            titleClassName="font-[family-name:var(--font-arizona-sans)]"
            priority={index}
          />
        ))}
      </SeenArticlesProvider>
    </main>
  );
}
