"use client";

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
  images: string[]; // All images (featured + gallery)
  content: string; // Sanitized HTML (Divi stripped)
  postId?: number; // WP post ID for comments (EM/IS only)
  currentSlug?: string; // Current article slug for More Articles carousel
  categoryColor?: string; // Hex color for category label
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
  postId,
  currentSlug,
  categoryColor,
  categoryColorMap,
  videoUrl,
}: ArticleLayoutProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-4xl mx-auto px-6 pt-28 pb-8">
        {/* Category + Read Time */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span className="font-semibold" style={categoryColor ? { color: categoryColor } : { color: '#000' }}>{category}</span>
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

        {/* YouTube Video or Featured Image / Gallery */}
        {videoUrl && getYouTubeId(videoUrl) ? (
          <div className="mb-8 -mx-6 md:mx-0">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full rounded-none md:rounded-lg"
                src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : images.length > 0 ? (
          <div className="mb-8 -mx-6 md:mx-0">
            <FeaturedMedia
              images={images.length > 1 ? images : images[0]}
              alt={title}
            />
          </div>
        ) : null}

        {/* Article Body */}
        <div
          className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-700 prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: content }}
        />

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
