import { notFound } from "next/navigation";
import { fetchArticleBySlug, fetchAllSlugs } from "@umg/api";
import { ArticleLayout } from "@umg/ui";
import { categories } from "../../../lib/categories";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await fetchAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found | International Spectrum" };
  }

  return {
    title: `${article.title} | International Spectrum`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const categoryColorMap = Object.fromEntries(categories.map((c) => [c.name, c.color]));
  const categoryColor = categoryColorMap[article.category];

  return (
    <ArticleLayout
      title={article.title}
      author={article.author_name}
      date={article.date}
      category={article.category}
      readTime={`${article.read_time_minutes} min read`}
      images={article.images}
      content={article.content}
      postId={article.id}
      currentSlug={article.slug}
      categoryColor={categoryColor}
      categoryColorMap={categoryColorMap}
      videoUrl={article.video_url}
    />
  );
}
