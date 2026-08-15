import { categories } from "@/lib/categories";
import {
  CategorySectionWrapper,
  SeenArticlesProvider,
  type SectionType,
} from "@umg/ui";

const SECTION_TYPE_MAP: Record<string, SectionType> = {
  communitypublicprograms: "type1",
  civicandculturalaffairs: "type2",
  arts: "type3",
  historylegacy: "type4",
  socialimpactjustice: "type1",
  leadershipyouthengagement: "type4-text",
  "video-interviews": "type4",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white max-w-280 mx-auto px-6 [&>section:last-child]:border-b-0">
      <SeenArticlesProvider>
        {/* Newest posts (articles + video interviews) across all categories.
            No `priority`: it doesn't take part in dedup, so category sections
            below are unaffected and may repeat these items. */}
        <CategorySectionWrapper
          latest
          slug="latest"
          category="Latest"
          sectionType="type1"
        />
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
