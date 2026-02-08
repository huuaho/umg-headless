import { categories } from "@/lib/categories";
import { CategorySectionWrapper, type SectionType } from "@umg/ui";

// TODO: Update section type mapping once IS categories are finalized
const SECTION_TYPE_MAP: Record<string, SectionType> = {
  "global-culture": "type1",
  "cross-cultural-stories": "type2",
  "arts-heritage": "type3",
  "travel-exchange": "type4",
  diaspora: "type1",
  perspectives: "type4-text",
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
