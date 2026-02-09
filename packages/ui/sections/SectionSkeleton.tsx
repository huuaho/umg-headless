interface SectionSkeletonProps {
  slug: string;
  category: string;
  categoryColor?: string;
}

export default function SectionSkeleton({
  slug,
  category,
  categoryColor,
}: SectionSkeletonProps) {
  return (
    <section
      id={slug}
      className="pt-6 pb-6 scroll-mt-24 border-b border-gray-300"
    >
      {/* Category Label */}
      <div className="mb-4">
        <span className="text-sm font-bold" style={categoryColor ? { color: categoryColor } : { color: '#000' }}>{category} &gt;</span>
      </div>

      {/* Skeleton content */}
      <div className="animate-pulse">
        <div className="lg:flex lg:gap-8">
          {/* Featured skeleton */}
          <div className="lg:w-2/3">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
            <div className="aspect-3/2 bg-gray-200 rounded" />
          </div>

          {/* Secondary skeletons */}
          <div className="lg:w-1/3 mt-6 lg:mt-0 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="py-3 border-b border-gray-200 last:border-0"
              >
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
