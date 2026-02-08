export interface Category {
  name: string;
  slug: string;
  color: string;
}

export const categories: Category[] = [
  { name: "Community & Public Programs", slug: "communitypublicprograms", color: "bg-blue-100" },
  { name: "Civic & Cultural Affairs", slug: "civicandculturalaffairs", color: "bg-green-100" },
  { name: "Arts", slug: "arts", color: "bg-yellow-100" },
  { name: "History & Legacy", slug: "historylegacy", color: "bg-purple-100" },
  { name: "Social Impact & Justice", slug: "socialimpactjustice", color: "bg-pink-100" },
  { name: "Leadership & Youth Engagement", slug: "leadershipyouthengagement", color: "bg-orange-100" },
];

// Header navigation — with 6 categories, split for responsive display
export const mainCategories = categories.slice(0, 2);
export const lgOnlyCategories = categories.slice(2, 4);
export const moreCategories = categories.slice(4);
export const allCategories = categories;

// Footer navigation
export const sortedCategories = [...categories].sort((a, b) =>
  a.name.localeCompare(b.name)
);
const midpoint = Math.ceil(sortedCategories.length / 2);
export const leftCategories = sortedCategories.slice(0, midpoint);
export const rightCategories = sortedCategories.slice(midpoint);
