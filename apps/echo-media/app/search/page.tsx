"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { searchArticles, type ApiArticle } from "@umg/api";
import { ArticleLink } from "@umg/ui";

function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

interface SearchResultCardProps {
  article: ApiArticle;
}

function SearchResultCard({ article }: SearchResultCardProps) {
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

function SearchResultsSkeleton() {
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

function SearchContent() {
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
          perPage: 20,
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
                Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total} {total === 1 ? "result" : "results"}
              </p>
            )}
          </>
        ) : (
          <h1 className="text-2xl font-bold mb-6">Search</h1>
        )}

        {isLoading && <SearchResultsSkeleton />}

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
                <SearchResultCard key={article.id} article={article} />
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

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchResultsSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}
