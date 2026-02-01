// Shared category configuration used across the site

export interface Category {
  name: string;
  slug: string;
  color: string; // Tailwind bg color class
}

export const categories: Category[] = [
  { name: "World News & Politics", slug: "world-news-politics", color: "bg-blue-100" },
  { name: "Profiles & Opinions", slug: "profiles-opinions", color: "bg-green-100" },
  { name: "Economy & Business", slug: "economy-business", color: "bg-yellow-100" },
  { name: "Diplomacy", slug: "diplomacy", color: "bg-purple-100" },
  { name: "Art & Culture", slug: "art-culture", color: "bg-pink-100" },
  { name: "Education & Youth", slug: "education-youth", color: "bg-orange-100" },
  { name: "Local Community", slug: "local-community", color: "bg-teal-100" },
  { name: "Wellbeing, Environment, Technology", slug: "wellbeing-env-tech", color: "bg-indigo-100" },
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
