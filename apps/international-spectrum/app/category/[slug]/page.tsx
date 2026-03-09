import { categories } from "../../../lib/categories";
import CategoryContent from "./CategoryContent";

export const dynamicParams = false;

export async function generateStaticParams() {
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  return {
    title: `${category?.name || slug} | International Spectrum`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  return <CategoryContent slug={slug} categoryName={category?.name || slug} />;
}
