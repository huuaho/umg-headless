// Shared category configuration used across the site

export interface Category {
  name: string;
  slug: string;
  color: string; // Hex color value
}

export const categories: Category[] = [
  { name: "World News & Politics", slug: "world-news-politics", color: "#3B82F6" },
  { name: "Profiles & Opinions", slug: "profiles-opinions", color: "#22C55E" },
  { name: "Economy & Business", slug: "economy-business", color: "#F59E0B" },
  { name: "Diplomacy", slug: "diplomacy", color: "#A855F7" },
  { name: "Art & Culture", slug: "art-culture", color: "#EC4899" },
  { name: "Education & Youth", slug: "education-youth", color: "#F97316" },
  { name: "Local Community", slug: "local-community", color: "#14B8A6" },
  { name: "Wellbeing, Environment, Technology", slug: "wellbeing-env-tech", color: "#6366F1" },
];

// Header navigation splits
export const mainCategories = categories.slice(0, 2); // Always visible on MD+
export const lgOnlyCategories = categories.slice(2, 4); // Economy & Business, Diplomacy - visible on LG+
export const moreCategories = categories.slice(4);
export const allCategories = categories;

// Footer navigation - alphabetically sorted and split into two columns
export const sortedCategories = [...categories].sort((a, b) =>
  a.name.localeCompare(b.name)
);
const midpoint = Math.ceil(sortedCategories.length / 2);
export const leftCategories = sortedCategories.slice(0, midpoint);
export const rightCategories = sortedCategories.slice(midpoint);
