import { categories } from "@/lib/categories";
import CategorySection from "@/components/CategorySection";
import SectionType1 from "@/components/sections/SectionType1";
import { sectionType1Data } from "@/lib/dummyData";

export default function Home() {
  return (
    <main className="min-h-screen bg-white max-w-[1300px] mx-auto px-4">
      {categories.map((category) => {
        // World News & Politics uses SectionType1
        if (category.slug === "world-news-politics") {
          return (
            <SectionType1
              key={category.slug}
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
