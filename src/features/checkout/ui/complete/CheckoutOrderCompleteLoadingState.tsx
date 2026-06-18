import { cn } from '@shared/lib/utils/style';

export default function CheckoutOrderCompleteLoadingState() {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lg dark:border-dark-border dark:bg-dark-panel">
      <div className="bg-primary-soft px-8 py-6 dark:bg-primary/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded-sm bg-line dark:bg-dark-bg-hover" />
            <div className="h-5 w-48 animate-pulse rounded-sm bg-line dark:bg-dark-bg-hover" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded-full bg-line dark:bg-dark-bg-hover" />
        </div>
      </div>
      <div className="p-8">
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'flex gap-6',
                index !== 1
                  ? 'border-b border-line dark:border-dark-border pb-6'
                  : '',
              )}
            >
              <div className="h-28 w-28 animate-pulse rounded-2xl bg-line sm:h-36 sm:w-36 dark:bg-dark-bg-hover" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-2/3 animate-pulse rounded-sm bg-line dark:bg-dark-bg-hover" />
                <div className="h-4 w-1/3 animate-pulse rounded-sm bg-line dark:bg-dark-bg-hover" />
                <div className="h-4 w-1/4 animate-pulse rounded-sm bg-line dark:bg-dark-bg-hover" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-line pt-6 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div className="h-5 w-28 animate-pulse rounded-sm bg-line dark:bg-dark-bg-hover" />
            <div className="h-6 w-24 animate-pulse rounded-sm bg-line dark:bg-dark-bg-hover" />
          </div>
        </div>
      </div>
    </section>
  );
}
