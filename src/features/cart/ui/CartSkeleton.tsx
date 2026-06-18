export default function CartSkeleton({ itemCount = 1 }) {
  return (
    <>
      {Array.from({ length: itemCount }).map((_, index) => (
        <li
          key={`cart-skeleton-${index}`}
          className="rounded-xl border border-line bg-surface p-3 shadow-xs sm:p-4 dark:border-dark-border dark:bg-dark-panel"
        >
          <div className="flex gap-3 sm:gap-4">
            <div className="h-26 w-26 shrink-0 animate-pulse rounded-md bg-line sm:h-34 sm:w-34 dark:bg-dark-bg-hover" />
            <div className="min-w-0 flex-1">
              <div className="flex min-h-28 flex-col sm:min-h-32">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-5 w-4/5 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                    <div className="h-8 w-8 animate-pulse rounded-full bg-line dark:bg-dark-border" />
                  </div>
                  <div className="mt-1.5 h-5 w-24 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                  <div className="mt-1.5 h-3.5 w-20 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                </div>
                <div className="mt-auto pt-1">
                  <div className="h-8 w-19 animate-pulse rounded-md bg-line dark:bg-dark-border" />
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </>
  );
}
