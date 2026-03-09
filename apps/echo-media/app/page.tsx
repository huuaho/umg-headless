import { categories } from "@/lib/categories";
import {
  CategorySectionWrapper,
  SeenArticlesProvider,
  type SectionType,
} from "@umg/ui";

const SECTION_TYPE_MAP: Record<string, SectionType> = {
  artculture: "type1",
  education: "type2",
  environment: "type3",
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
            categoryColor={category.color}
            sectionType={SECTION_TYPE_MAP[category.slug] || "type1"}
            priority={index}
          />
        ))}
      </SeenArticlesProvider>
    </main>
  );
}
