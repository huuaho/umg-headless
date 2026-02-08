import { categories } from "@/lib/categories";
import { CategorySectionWrapper, type SectionType } from "@umg/ui";

const SECTION_TYPE_MAP: Record<string, SectionType> = {
  communitypublicprograms: "type1",
  civicandculturalaffairs: "type2",
  arts: "type3",
  historylegacy: "type4",
  socialimpactjustice: "type1",
  leadershipyouthengagement: "type4-text",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white max-w-280 mx-auto px-6 [&>section:last-child]:border-b-0">
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
