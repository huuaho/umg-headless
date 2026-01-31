import { categories } from "@/lib/categories";
import CategorySection from "@/components/CategorySection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {categories.map((category) => (
        <CategorySection key={category.slug} category={category} />
      ))}
    </main>
  );
}
