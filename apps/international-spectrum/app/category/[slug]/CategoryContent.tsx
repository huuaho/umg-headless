"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { fetchArticles, type ApiArticle } from "@umg/api";
import { ArticleLink } from "@umg/ui";

function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

function ResultCard({ article }: { article: ApiArticle }) {
  const firstImage = article.images?.[0] || article.featured_image;
  const readTime = article.read_time_minutes
    ? `${article.read_time_minutes} min read`
    : "";
  const [imageError, setImageError] = useState(false);

  return (
    <article className="py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex gap-4">
        <div className="shrink-0 w-24 h-16 md:w-32 md:h-20 relative bg-gray-100">
          {firstImage && !imageError && (
            <Image
              src={firstImage}
              alt={article.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            {article.category && <span>{decodeHtmlEntities(article.category)}</span>}
            {article.category && article.source_label && <span>&middot;</span>}
            {article.source_label && <span>{article.source_label}</span>}
          </div>
          <h2 className="font-semibold text-base leading-tight mb-1">
            <ArticleLink slug={article.slug} url={article.source_url} className="hover:underline">
              {article.title}
            </ArticleLink>
          </h2>
          <p className="text-sm text-gray-600 line-clamp-2 mb-1">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {article.author_name && <span>By {article.author_name}</span>}
            {article.author_name && readTime && <span>&middot;</span>}
            {readTime && <span>{readTime}</span>}
          </div>
        </div>
      </div>
    </article>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="py-4 border-b border-gray-200 animate-pulse">
          <div className="flex gap-4">
            <div className="shrink-0 w-24 h-16 md:w-32 md:h-20 bg-gray-200" />
            <div className="flex-1">
              <div className="h-3 bg-gray-200 w-24 mb-2" />
              <div className="h-5 bg-gray-200 w-full mb-2" />
              <div className="h-4 bg-gray-200 w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const PER_PAGE = 20;

export default function CategoryContent({
  slug,
  categoryName,
}: {
  slug: string;
  categoryName: string;
}) {
  const [results, setResults] = useState<ApiArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const loadArticles = useCallback(
    async (pageNum: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchArticles({
          category: slug,
          perPage: PER_PAGE,
          page: pageNum,
        });
        setResults(response.items);
        setTotal(response.total);
        setTotalPages(response.total_pages);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load articles"));
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [slug],
  );

  useEffect(() => {
    loadArticles(1);
  }, [loadArticles]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadArticles(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-white max-w-325 mx-auto px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">{categoryName}</h1>
        {!isLoading && !error && total > 0 && (
          <p className="text-sm text-gray-500 mb-6">
            Showing {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, total)} of {total}{" "}
            {total === 1 ? "article" : "articles"}
          </p>
        )}

        {isLoading && <ResultsSkeleton />}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Something went wrong. Please try again.
            </p>
            <button
              onClick={() => loadArticles(page)}
              className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && results.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No articles found in this category.
            </p>
          </div>
        )}

        {!isLoading && !error && results.length > 0 && (
          <>
            <div className="divide-y divide-gray-200">
              {results.map((article) => (
                <ResultCard key={article.id} article={article} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
