"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchArticles, type ApiArticle } from "@umg/api";
import ResultCard from "./ResultCard";
import ResultsSkeleton from "./ResultsSkeleton";

const PER_PAGE = 20;

interface CategoryContentProps {
  slug: string;
  categoryName: string;
  externalOnly?: boolean;
}

export default function CategoryContent({
  slug,
  categoryName,
  externalOnly,
}: CategoryContentProps) {
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
        setError(
          err instanceof Error ? err : new Error("Failed to load articles"),
        );
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
            Showing {(page - 1) * PER_PAGE + 1}-
            {Math.min(page * PER_PAGE, total)} of {total}{" "}
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
                <ResultCard
                  key={article.id}
                  article={article}
                  externalOnly={externalOnly}
                />
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
