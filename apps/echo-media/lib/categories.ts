export interface Category {
  name: string;
  slug: string;
  color: string;
}

export const categories: Category[] = [
  { name: "Art & Culture", slug: "artculture", color: "bg-pink-100" },
  { name: "Education", slug: "education", color: "bg-blue-100" },
  { name: "Environment", slug: "environment", color: "bg-green-100" },
];

// Header navigation — all 3 categories always visible
export const mainCategories = categories;
export const lgOnlyCategories: Category[] = [];
export const moreCategories: Category[] = [];
export const allCategories = categories;

// Footer navigation
export const sortedCategories = [...categories].sort((a, b) =>
  a.name.localeCompare(b.name)
);
const midpoint = Math.ceil(sortedCategories.length / 2);
export const leftCategories = sortedCategories.slice(0, midpoint);
export const rightCategories = sortedCategories.slice(midpoint);
