import { Category } from "@/lib/categories";

interface CategorySectionProps {
  category: Category;
}

export default function CategorySection({ category }: CategorySectionProps) {
  return (
    <section
      id={category.slug}
      className={`h-64 ${category.color} flex items-center justify-center`}
    >
      <h2 className="text-xl font-bold text-[#212223]">{category.name}</h2>
    </section>
  );
}
