export interface Category {
  name: string;
  slug: string;
  color: string;
}

// TODO: Update with International Spectrum's actual WordPress categories
export const categories: Category[] = [
  { name: "Global Culture", slug: "global-culture", color: "bg-blue-100" },
  { name: "Cross-Cultural Stories", slug: "cross-cultural-stories", color: "bg-green-100" },
  { name: "Arts & Heritage", slug: "arts-heritage", color: "bg-yellow-100" },
  { name: "Travel & Exchange", slug: "travel-exchange", color: "bg-purple-100" },
  { name: "Diaspora", slug: "diaspora", color: "bg-pink-100" },
  { name: "Perspectives", slug: "perspectives", color: "bg-orange-100" },
];
