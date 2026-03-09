"use client";

import { useState } from "react";
import Image from "next/image";
import ArticleLink from "./ArticleLink";
import type { ApiArticle } from "@umg/api";

function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

interface ResultCardProps {
  article: ApiArticle;
  externalOnly?: boolean;
}

export default function ResultCard({ article, externalOnly }: ResultCardProps) {
  const firstImage = article.images?.[0] || article.featured_image;
  const readTime = article.read_time_minutes
    ? `${article.read_time_minutes} min read`
    : "";
  const [imageError, setImageError] = useState(false);
  const [isVertical, setIsVertical] = useState(false);

  return (
    <article className="py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex gap-4">
        <div className="shrink-0 w-24 h-16 md:w-32 md:h-20 relative bg-black">
          {firstImage && !imageError && (
            <Image
              src={firstImage}
              alt={article.title}
              fill
              className={isVertical ? "object-contain" : "object-cover"}
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                setIsVertical(img.naturalHeight > img.naturalWidth);
              }}
              onError={() => setImageError(true)}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            {article.category && (
              <span>{decodeHtmlEntities(article.category)}</span>
            )}
            {article.category && article.source_label && <span>&middot;</span>}
            {article.source_label && <span>{article.source_label}</span>}
          </div>
          <h2 className="font-semibold text-base leading-tight mb-1">
            {externalOnly ? (
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {article.title}
              </a>
            ) : (
              <ArticleLink
                slug={article.slug}
                url={article.source_url}
                className="hover:underline"
              >
                {article.title}
              </ArticleLink>
            )}
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
