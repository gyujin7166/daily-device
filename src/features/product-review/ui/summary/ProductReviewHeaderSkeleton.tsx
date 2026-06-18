export function ProductReviewScoreSkeleton() {
  return (
    <>
      <div className="flex items-end justify-center gap-2">
        <div className="h-16 w-28 animate-pulse rounded-sm bg-line sm:h-20 sm:w-36 dark:bg-dark-border" />
        <div className="mb-2 h-5 w-10 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
      </div>
      <div className="mt-3 h-5 w-35 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
      <div className="mt-3 h-4 w-42.5 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
    </>
  );
}

export function ProductReviewProgressSkeleton() {
  return (
    <div className="h-2.5 min-w-0 flex-1 animate-pulse rounded-full bg-line dark:bg-dark-border" />
  );
}
