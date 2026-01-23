interface TaskSkeletonProps {
  count?: number;
}

export function TaskSkeleton({ count = 3 }: TaskSkeletonProps) {
  return (
    <div className="mb-6">
      {/* Skeleton card wrapper matching TaskDateGroup style */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex items-center py-4 px-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
          >
            {/* Checkbox skeleton */}
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />

            {/* Priority dot skeleton */}
            <div className="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse ml-3" />

            {/* Title skeleton */}
            <div className="flex-1 ml-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            </div>

            {/* Estimated time skeleton */}
            <div className="w-28 flex justify-center">
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>

            {/* Consumed time skeleton */}
            <div className="w-28 flex justify-center">
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>

            {/* Action icons skeleton */}
            <div className="w-24 flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
