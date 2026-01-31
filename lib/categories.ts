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
export const mainCategories = categories.slice(0, 3);
export const lgOnlyCategory = categories[3]; // Diplomacy
export const moreCategories = categories.slice(4);
export const allCategories = categories;
