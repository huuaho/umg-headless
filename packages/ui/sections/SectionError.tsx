"use client";

import CategoryLabel from "./CategoryLabel";

interface SectionErrorProps {
  slug: string;
  category: string;
  categoryColor?: string;
  categoryIcon?: string;
  message: string;
  onRetry: () => void;
}

export default function SectionError({
  slug,
  category,
  categoryColor,
  categoryIcon,
  message,
  onRetry,
}: SectionErrorProps) {
  return (
    <section
      id={slug}
      className="pt-6 pb-6 scroll-mt-24 border-b border-gray-300"
    >
      <CategoryLabel category={category} categoryColor={categoryColor} categoryIcon={categoryIcon} />

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
