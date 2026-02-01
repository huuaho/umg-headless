import { categories } from "@/lib/categories";
import CategorySectionWrapper, {
  type SectionType,
} from "@/components/sections/CategorySectionWrapper";

// Category slug to section type mapping
const SECTION_TYPE_MAP: Record<string, SectionType> = {
  "world-news-politics": "type1",
  "profiles-opinions": "type2",
  "economy-business": "type3",
  diplomacy: "type4",
  "art-culture": "type4-text",
  "education-youth": "type1",
  "local-community": "type2",
  "wellbeing-env-tech": "type3",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white max-w-325 mx-auto px-6">
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
