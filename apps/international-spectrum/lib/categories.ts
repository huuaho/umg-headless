export interface Category {
  name: string;
  slug: string;
  color: string;
}

export const categories: Category[] = [
  { name: "Community & Public Programs", slug: "communitypublicprograms", color: "#ea1479" },
  { name: "Civic & Cultural Affairs", slug: "civicandculturalaffairs", color: "#66c2ad" },
  { name: "Arts", slug: "arts", color: "#655aa8" },
  { name: "History & Legacy", slug: "historylegacy", color: "#feb70c" },
  { name: "Social Impact & Justice", slug: "socialimpactjustice", color: "#ea1479" },
  { name: "Leadership & Youth Engagement", slug: "leadershipyouthengagement", color: "#66c2ad" },
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
