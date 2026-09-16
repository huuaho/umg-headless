"use client";

import Link from "next/link";
import type { ContentBlock } from "@umg/api";
import ArticleBody from "./ArticleBody";
import FeaturedMedia from "../sections/components/FeaturedMedia";
import CommentsSection from "./CommentsSection";
import MoreArticles from "./MoreArticles";

/**
 * Extract YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

interface ArticleLayoutProps {
  title: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  images: string[]; // All images (featured + gallery) — legacy fallback only
  content: string; // Sanitized HTML (Divi stripped) — legacy fallback only
  blocks?: ContentBlock[]; // Ordered body blocks; images stay where the author put them
  postId?: number; // WP post ID for comments (EM/IS only)
  currentSlug?: string; // Current article slug for More Articles carousel
  categoryColor?: string; // Hex color for category label
  categorySlug?: string; // Category slug — links to /category/{slug}
  categoryColorMap?: Record<string, string>; // Map of category names to hex colors for More Articles
  videoUrl?: string; // YouTube URL for video interviews
}

export default function ArticleLayout({
  title,
  author,
  date,
  category,
  readTime,
  images,
  content,
  blocks,
  postId,
  currentSlug,
  categoryColor,
  categorySlug,
  categoryColorMap,
  videoUrl,
}: ArticleLayoutProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const youTubeId = videoUrl ? getYouTubeId(videoUrl) : null;
  const hasBlocks = Boolean(blocks && blocks.length > 0);

  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-4xl mx-auto px-6 pt-28 pb-8">
        {/* Category + Read Time */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          {categorySlug ? (
            <Link
              href={`/category/${categorySlug}`}
              className="font-semibold hover:underline"
              style={categoryColor ? { color: categoryColor, textDecorationColor: categoryColor } : { color: '#000', textDecorationColor: '#000' }}
            >
              {category}
            </Link>
          ) : (
            <span className="font-semibold" style={categoryColor ? { color: categoryColor } : { color: '#000' }}>{category}</span>
          )}
          <span>&middot;</span>
          <span>{readTime}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
          {title}
        </h1>

        {/* Author + Date */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <span>By {author}</span>
          <span>&middot;</span>
          <time dateTime={date}>{formattedDate}</time>
        </div>

        {/* YouTube video takes the hero slot when present */}
        {youTubeId && (
          <div className="mb-8 -mx-6 md:mx-0">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full rounded-none md:rounded-lg"
                src={`https://www.youtube.com/embed/${youTubeId}`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Article Body */}
        {hasBlocks ? (
          <ArticleBody
            blocks={blocks!}
            title={title}
            leadBlockIsHero={!youTubeId}
          />
        ) : (
          <>
            {/* Legacy path: every image hoisted into one carousel above the body */}
            {!youTubeId && images.length > 0 && (
              <div className="mb-8 -mx-6 md:mx-0">
                <FeaturedMedia
                  images={images.length > 1 ? images : images[0]}
                  alt={title}
                />
              </div>
            )}
            <div
              className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-700 prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </>
        )}

        {/* Comments Section */}
        {postId != null && <CommentsSection postId={postId} />}

        {/* More Articles Carousel */}
        {currentSlug && category && (
          <MoreArticles currentSlug={currentSlug} category={category} categoryColorMap={categoryColorMap} />
        )}
      </article>
    </main>
  );
}
