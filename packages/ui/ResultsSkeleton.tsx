export default function ResultsSkeleton() {
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
