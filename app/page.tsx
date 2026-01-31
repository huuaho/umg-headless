import { categories } from "@/lib/categories";
import CategorySection from "@/components/CategorySection";
import SectionType1 from "@/components/sections/SectionType1";
import SectionType2 from "@/components/sections/SectionType2";
import { sectionType1Data, sectionType2Data } from "@/lib/dummyData";

export default function Home() {
  return (
    <main className="min-h-screen bg-white max-w-[1300px] mx-auto px-6">
      {categories.map((category) => {
        // World News & Politics uses SectionType1
        if (category.slug === "world-news-politics") {
          return (
            <SectionType1
              key={category.slug}
              slug={category.slug}
              category={category.name}
              featured={sectionType1Data.featured}
              secondary={sectionType1Data.secondary}
            />
          );
        }
        // Profiles & Opinions uses SectionType2
        if (category.slug === "profiles-opinions") {
          return (
            <SectionType2
              key={category.slug}
              slug={category.slug}
              category={category.name}
              featured={sectionType2Data.featured}
              secondary={sectionType2Data.secondary}
            />
          );
        }
        // Economy & Business uses SectionType1 (for visual testing)
        if (category.slug === "economy-business") {
          return (
            <SectionType1
              key={category.slug}
              slug={category.slug}
              category={category.name}
              featured={sectionType1Data.featured}
              secondary={sectionType1Data.secondary}
            />
          );
        }
        // Other categories use placeholder
        return <CategorySection key={category.slug} category={category} />;
      })}
    </main>
  );
}
