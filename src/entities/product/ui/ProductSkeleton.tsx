type ProductSkeletonProps = {
  variant: 'product' | 'search';
  columns?: 'three' | 'four';
  length?: number;
};

const pulseClassName = 'animate-pulse bg-line dark:bg-dark-bg-hover';

export default function ProductSkeleton({
  variant,
  columns,
  length = 3,
}: ProductSkeletonProps) {
  const resolvedColumns = columns ?? (variant === 'search' ? 'four' : 'three');
  const gridClassName =
    resolvedColumns === 'four'
      ? 'grid grid-cols-2 items-stretch gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4'
      : 'grid grid-cols-2 items-stretch gap-3 sm:gap-5 xl:grid-cols-3';

  return (
    <div className={gridClassName}>
      {Array.from({ length }).map((_, index) => (
        <ProductSkeletonCard key={index} variant={variant} />
      ))}
    </div>
  );
}

function ProductSkeletonCard({
  variant,
}: Pick<ProductSkeletonProps, 'variant'>) {
  if (variant === 'search') {
    return (
      <article className="flex h-full flex-col rounded-3xl border border-line bg-surface p-4 shadow-xs dark:border-dark-border dark:bg-dark-panel">
        <div className="relative">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-primary-soft/55 p-4 dark:bg-dark-bg-hover">
            <div className={`h-full w-full rounded-2xl ${pulseClassName}`} />
          </div>
          <div
            className={`absolute right-3 top-3 h-9 w-9 rounded-full ${pulseClassName}`}
          />
        </div>

        <div className="mt-4 flex flex-1 flex-col">
          <div className={`h-3 w-20 rounded-sm ${pulseClassName}`} />
          <div
            className={`mt-1 h-5 w-[72%] rounded-sm sm:h-6 ${pulseClassName}`}
          />
          <div className={`mt-1.5 h-4 w-[86%] rounded-sm ${pulseClassName}`} />
          <div className={`mt-1 h-4 w-[70%] rounded-sm ${pulseClassName}`} />

          <div className="mt-auto pt-4">
            <div className="flex min-h-5 items-center gap-1.5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`size-5 rounded-full ${pulseClassName}`}
                />
              ))}
            </div>
            <div className={`mt-3 h-5 w-24 rounded-sm ${pulseClassName}`} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col rounded-3xl bg-surface p-3 shadow-xs sm:p-3 dark:bg-dark-panel">
      <div className="relative">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-line dark:bg-dark-bg-hover">
          <div className={`h-full w-full ${pulseClassName}`} />
        </div>
        <div
          className={`absolute right-2 top-2 h-8 w-8 rounded-full sm:right-2.5 sm:top-2.5 sm:h-9 sm:w-9 ${pulseClassName}`}
        />
      </div>

      <div className="mt-3 flex flex-1 flex-col px-1 pb-1 sm:mt-2">
        <div className={`h-3 w-20 rounded-sm ${pulseClassName}`} />
        <div
          className={`mt-1 h-5 w-[72%] rounded-sm sm:h-6 ${pulseClassName}`}
        />
        <div
          className={`mt-1.5 h-[1.45em] w-[88%] rounded-sm ${pulseClassName}`}
        />

        <div className="mt-3 flex min-h-5 w-full items-center justify-start">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={`size-5 rounded-full sm:size-6 ${pulseClassName}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-auto flex min-h-11 items-end justify-between gap-3 pt-3">
          <div className="space-y-1">
            <div className={`h-3 w-18 rounded-sm ${pulseClassName}`} />
            <div className={`h-5 w-22 rounded-sm ${pulseClassName}`} />
          </div>
          <div className={`size-10 shrink-0 rounded-full ${pulseClassName}`} />
        </div>
      </div>
    </article>
  );
}
