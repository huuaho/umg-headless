"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import type { ApiArticle } from "@umg/api";
import { fetchArticles } from "@umg/api";
import ArticleLink from "../ArticleLink";

const CATEGORY_COUNT = 5;
const TOTAL_COUNT = 10;

interface MoreArticlesProps {
  currentSlug: string;
  category: string;
  categoryColorMap?: Record<string, string>;
}

/**
 * Interleave two arrays: [a[0], b[0], a[1], b[1], ...]
 */
function interleave(a: ApiArticle[], b: ApiArticle[]): ApiArticle[] {
  const result: ApiArticle[] = [];
  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < a.length) result.push(a[i]);
    if (i < b.length) result.push(b[i]);
  }
  return result;
}

export default function MoreArticles({
  currentSlug,
  category,
  categoryColorMap,
}: MoreArticlesProps) {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || articles.length === 0) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [articles, updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = window.innerWidth >= 768 ? 288 : 256; // md:w-72 : w-64
    const distance = cardWidth + 16; // card width + gap-4
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch category articles and recent articles in parallel
        const [categoryRes, recentRes] = await Promise.all([
          fetchArticles({ category, perPage: CATEGORY_COUNT + 1 }),
          fetchArticles({ perPage: TOTAL_COUNT + CATEGORY_COUNT + 1 }),
        ]);

        if (cancelled) return;

        // Remove current article from both lists
        const catArticles = categoryRes.items.filter(
          (a) => a.slug !== currentSlug
        );
        const allRecent = recentRes.items.filter(
          (a) => a.slug !== currentSlug
        );

        // Take up to 5 from category
        const catPick = catArticles.slice(0, CATEGORY_COUNT);
        const catSlugs = new Set(catPick.map((a) => a.slug));

        // From recent, remove duplicates already in category pick
        const recentUnique = allRecent.filter((a) => !catSlugs.has(a.slug));

        // If category has fewer than 5, backfill from recent
        const backfillNeeded = CATEGORY_COUNT - catPick.length;
        let recentPick: ApiArticle[];
        if (backfillNeeded > 0) {
          const backfill = recentUnique.splice(0, backfillNeeded);
          catPick.push(...backfill);
          recentPick = recentUnique.slice(0, TOTAL_COUNT - catPick.length);
        } else {
          recentPick = recentUnique.slice(0, TOTAL_COUNT - CATEGORY_COUNT);
        }

        // Interleave and trim to total
        const merged = interleave(catPick, recentPick).slice(0, TOTAL_COUNT);
        setArticles(merged);
      } catch {
        if (!cancelled) {
          setError("Failed to load more articles.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [currentSlug, category]);

  // Don't render section at all if nothing to show after loading
  if (!isLoading && !error && articles.length === 0) return null;

  return (
    <section className="pt-8 pb-12 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">More Articles</h2>
        {!isLoading && !error && articles.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className="p-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12L6 8L10 4" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="p-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4L10 8L6 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex gap-4 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-64 md:w-72 flex-shrink-0">
              <div className="w-full aspect-3/2 bg-gray-200 animate-pulse rounded" />
              <div className="h-3 w-16 bg-gray-200 animate-pulse rounded mt-3" />
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded mt-2" />
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mt-1" />
              <div className="h-3 w-20 bg-gray-200 animate-pulse rounded mt-2" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-gray-600 hover:text-black underline"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && articles.length > 0 && (
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">
          {articles.map((article) => (
            <ArticleLink
              key={article.slug}
              slug={article.slug}
              url={article.source_url}
              className="w-64 md:w-72 flex-shrink-0 snap-start hover:opacity-80 transition-opacity"
            >
              {article.featured_image ? (
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  width={288}
                  height={192}
                  className="w-full aspect-3/2 object-cover rounded bg-gray-100"
                />
              ) : (
                <div className="w-full aspect-3/2 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
              <p
                className="text-xs font-semibold uppercase tracking-wide mt-2"
                style={{ color: (categoryColorMap && article.category && categoryColorMap[article.category]) || '#6b7280' }}
              >
                {article.category}
              </p>
              <h3 className="text-sm font-semibold leading-snug line-clamp-2 mt-1 text-gray-900">
                {article.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(article.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </ArticleLink>
          ))}
        </div>
      )}
    </section>
  );
}
