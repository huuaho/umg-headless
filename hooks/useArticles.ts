"use client";

import { useState, useEffect, useCallback } from "react";
import type { ApiArticle } from "@/lib/api/types";
import { fetchArticles } from "@/lib/api/client";

interface UseArticlesOptions {
  category: string;
  count?: number;
}

interface UseArticlesResult {
  articles: ApiArticle[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch articles for a category with loading and error states
 */
export function useArticles({
  category,
  count = 5,
}: UseArticlesOptions): UseArticlesResult {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchArticles({
        category,
        perPage: count,
      });
      setArticles(response.items);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch articles")
      );
    } finally {
      setIsLoading(false);
    }
  }, [category, count]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    articles,
    isLoading,
    error,
    refetch: fetchData,
  };
}
