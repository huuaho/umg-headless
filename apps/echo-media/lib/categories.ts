export interface Category {
  name: string;
  slug: string;
  color: string;
}

// TODO: Update with Echo Media's actual WordPress categories
export const categories: Category[] = [
  { name: "Education", slug: "education", color: "bg-blue-100" },
  { name: "Youth Development", slug: "youth-development", color: "bg-green-100" },
  { name: "Personal Growth", slug: "personal-growth", color: "bg-yellow-100" },
  { name: "Community", slug: "community", color: "bg-purple-100" },
  { name: "Inspiration", slug: "inspiration", color: "bg-pink-100" },
  { name: "Resources", slug: "resources", color: "bg-orange-100" },
];
