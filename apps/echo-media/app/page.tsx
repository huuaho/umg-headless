import { categories } from "@/lib/categories";
import { CategorySectionWrapper, type SectionType } from "@umg/ui";

// TODO: Update section type mapping once EM categories are finalized
const SECTION_TYPE_MAP: Record<string, SectionType> = {
  education: "type1",
  "youth-development": "type2",
  "personal-growth": "type3",
  community: "type4",
  inspiration: "type1",
  resources: "type4-text",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white max-w-280 mx-auto px-6">
      {categories.map((category) => (
        <CategorySectionWrapper
          key={category.slug}
          slug={category.slug}
          category={category.name}
          sectionType={SECTION_TYPE_MAP[category.slug] || "type1"}
        />
      ))}
    </main>
  );
}
