export default function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse text-ink dark:text-surface">
      <div className="pt-1">
        <div className="h-3 w-28 rounded-sm bg-line dark:bg-dark-bg-hover" />
        <div className="mt-2 flex items-start justify-between gap-3">
          <div className="h-10 w-2/3 rounded-sm bg-line dark:bg-dark-bg-hover sm:h-12" />
          <div className="h-10 w-10 shrink-0 rounded-full bg-line dark:bg-dark-bg-hover" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full rounded-sm bg-line dark:bg-dark-bg-hover" />
          <div className="h-4 w-4/5 rounded-sm bg-line dark:bg-dark-bg-hover" />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="h-4 w-23 rounded-sm bg-line dark:bg-dark-bg-hover" />
        <div className="h-4 w-21 rounded-sm bg-line dark:bg-dark-bg-hover" />
      </div>

      <div className="mt-5 h-11 w-44 rounded-sm bg-line dark:bg-dark-bg-hover sm:h-12 sm:w-52" />

      <div className="mt-6">
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-8 w-8 rounded-full bg-line dark:bg-dark-bg-hover"
            />
          ))}
        </div>
        <div className="mt-2 h-3 w-14 rounded-sm bg-line dark:bg-dark-bg-hover" />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="h-13 w-full rounded-full bg-line dark:bg-dark-bg-hover" />
        <div className="h-13 w-full rounded-full bg-line dark:bg-dark-bg-hover" />
      </div>

      <div className="mt-6 space-y-2">
        <div className="h-4 w-full rounded-sm bg-line dark:bg-dark-bg-hover" />
        <div className="h-4 w-5/6 rounded-sm bg-line dark:bg-dark-bg-hover" />
      </div>

      <div className="mt-10 border-t border-line dark:border-dark-border">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-line py-4.5 dark:border-dark-border"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-5 rounded-sm bg-line dark:bg-dark-bg-hover" />
              <div className="h-7 w-28 rounded-sm bg-line dark:bg-dark-bg-hover" />
            </div>
            <div className="h-5 w-5 rounded-sm bg-line dark:bg-dark-bg-hover" />
          </div>
        ))}
      </div>
    </div>
  );
}
