"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import { searchArticles, type ApiArticle } from "@umg/api";
import ResultCard from "./ResultCard";
import ResultsSkeleton from "./ResultsSkeleton";

const PER_PAGE = 20;

function SearchBar({ initialQuery }: { initialQuery: string }) {
  const [searchInput, setSearchInput] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?search=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search articles..."
          className="flex-1 h-12 px-5 text-lg border border-gray-300 border-r-0 text-[#212223] placeholder-[#5d5d5d] focus:outline-none focus:border-[#404040]"
          autoFocus
        />
        <button
          type="submit"
          className="h-12 px-6 bg-[#8b8b8b] hover:bg-[#6b6b6b] transition-colors"
          aria-label="Search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-white"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}

function SearchInner({ externalOnly }: { externalOnly?: boolean }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("search") || "";

  const [results, setResults] = useState<ApiArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const performSearch = useCallback(
    async (searchQuery: string, pageNum: number) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setTotal(0);
        setTotalPages(0);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await searchArticles({
          search: searchQuery,
          page: pageNum,
          perPage: PER_PAGE,
        });
        setResults(response.items);
        setTotal(response.total);
        setTotalPages(response.total_pages);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Search failed"));
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    setPage(1);
    performSearch(query, 1);
  }, [query, performSearch]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    performSearch(query, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-white max-w-325 mx-auto px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <SearchBar initialQuery={query} />

        {query ? (
          <>
            <h1 className="text-2xl font-bold mb-2">
              Search results for &ldquo;{query}&rdquo;
            </h1>
            {!isLoading && !error && (
              <p className="text-sm text-gray-500 mb-6">
                Showing {(page - 1) * PER_PAGE + 1}-
                {Math.min(page * PER_PAGE, total)} of {total}{" "}
                {total === 1 ? "result" : "results"}
              </p>
            )}
          </>
        ) : (
          <h1 className="text-2xl font-bold mb-6">Search</h1>
        )}

        {isLoading && <ResultsSkeleton />}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Something went wrong. Please try again.
            </p>
            <button
              onClick={() => performSearch(query, page)}
              className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && query && results.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No results found for &ldquo;{query}&rdquo;
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Try different keywords or check your spelling.
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

        {!query && (
          <p className="text-gray-600">Enter a search term to find articles.</p>
        )}
      </div>
    </main>
  );
}

export default function SearchContent({
  externalOnly,
}: {
  externalOnly?: boolean;
}) {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <SearchInner externalOnly={externalOnly} />
    </Suspense>
  );
}
