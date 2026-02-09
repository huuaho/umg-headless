"use client";

interface SectionErrorProps {
  slug: string;
  category: string;
  categoryColor?: string;
  message: string;
  onRetry: () => void;
}

export default function SectionError({
  slug,
  category,
  categoryColor,
  message,
  onRetry,
}: SectionErrorProps) {
  return (
    <section
      id={slug}
      className="pt-6 pb-6 scroll-mt-24 border-b border-gray-300"
    >
      {/* Category Label */}
      <div className="mb-4">
        <span className="text-sm font-bold" style={categoryColor ? { color: categoryColor } : { color: '#000' }}>{category} &gt;</span>
      </div>

      {/* Error content */}
      <div className="py-12 text-center">
        <p className="text-gray-500 mb-4">Unable to load articles: {message}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </section>
  );
}
