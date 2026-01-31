import { categories } from "@/lib/categories";
import SectionType1 from "@/components/sections/SectionType1";
import SectionType2 from "@/components/sections/SectionType2";
import SectionType3 from "@/components/sections/SectionType3";
import { sectionType1Data, sectionType2Data, sectionType3Data } from "@/lib/dummyData";

// Section options for random assignment (component + matching data)
const sectionOptions = [
  { Component: SectionType1, data: sectionType1Data },
  { Component: SectionType2, data: sectionType2Data },
  { Component: SectionType3, data: sectionType3Data },
];

// Simple hash function for consistent pseudo-random selection based on slug
const getHashIndex = (slug: string) => {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % sectionOptions.length;
};

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
        // Economy & Business uses SectionType3 (4 articles: 1 featured + 3 secondary)
        if (category.slug === "economy-business") {
          return (
            <SectionType3
              key={category.slug}
              slug={category.slug}
              category={category.name}
              featured={sectionType3Data.featured}
              secondary={sectionType3Data.secondary}
            />
          );
        }
        // Other categories randomly pick a section type (consistent per slug)
        const option = sectionOptions[getHashIndex(category.slug)];
        return (
          <option.Component
            key={category.slug}
            slug={category.slug}
            category={category.name}
            featured={option.data.featured}
            secondary={option.data.secondary}
          />
        );
      })}
    </main>
  );
}
