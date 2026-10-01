import { videoInterviewsCategory } from "@/lib/categories";
import { getActiveCategories } from "@/lib/activeCategories";
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
  "wellbeing-env-tech": "type4",
};

// Shared styling for every homepage section
const SECTION_STYLE = {
  categoryUnderlineColor: "#33bbff",
  titleClassName: "font-[family-name:var(--font-arizona-sans)]",
};

export default async function Home() {
  // Same build-time filter the nav uses, so we don't emit a section (and its
  // fetch) for a category that has nothing in it.
  const categories = await getActiveCategories();

  return (
    <main className="min-h-screen bg-white max-w-280 mx-auto px-6 [&>section:last-child]:border-b-0">
      {/* Visually hidden page descriptor for crawlers/screen readers (AEO ticket 03) */}
      <h1 className="sr-only">
        United Media Group — Washington DC Multicultural Media: Echo Media,
        International Spectrum
      </h1>
      <SeenArticlesProvider>
        {/* Newest posts across all sources/categories (same pattern as the
            International Spectrum homepage). No `priority`: it doesn't take
            part in dedup, so the category sections below are unaffected. */}
        <CategorySectionWrapper
          latest
          slug="latest"
          category="Latest"
          sectionType="type1"
          {...SECTION_STYLE}
        />
        {/* Video Interviews — client request (2026-08-28): visible on the
            front page, directly under Latest, but not in the top nav. */}
        <CategorySectionWrapper
          slug={videoInterviewsCategory.slug}
          category={videoInterviewsCategory.name}
          sectionType="type4"
          priority={0}
          hideWhenEmpty
          {...SECTION_STYLE}
        />
        {/* `hideWhenEmpty` stays as the runtime backstop: getActiveCategories()
            filters out what was empty at build time, but a category can empty
            out (or a build can fall back to the full list) afterwards, and then
            this renders nothing instead of a "No articles found" card. */}
        {categories.map((category, index) => (
          <CategorySectionWrapper
            key={category.slug}
            slug={category.slug}
            category={category.name}
            sectionType={SECTION_TYPE_MAP[category.slug] || "type1"}
            priority={index + 1}
            hideWhenEmpty
            {...SECTION_STYLE}
          />
        ))}
      </SeenArticlesProvider>
    </main>
  );
}
