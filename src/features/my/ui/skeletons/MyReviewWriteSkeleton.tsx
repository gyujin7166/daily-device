import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

export default function MyReviewWriteSkeleton() {
  return (
    <PageWrapper size="form" className="mt-22.5 max-w-175 pb-12 pt-5 sm:pt-6">
      <div className="mx-auto max-w-full animate-pulse">
        <div className="mb-10 space-y-2 px-1 sm:px-2">
          <div className="h-10 w-40 rounded-sm bg-line dark:bg-dark-bg-hover" />
          <div className="h-5 w-80 rounded-sm bg-line dark:bg-dark-bg-hover" />
        </div>

        <div className="mb-10 flex gap-4 rounded-2xl border border-line bg-surface p-4 shadow-xs sm:gap-6 sm:p-6 dark:border-dark-border dark:bg-dark-bg">
          <div className="h-24 w-24 rounded-2xl bg-line sm:h-36 sm:w-36 dark:bg-dark-bg-hover" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-44 rounded-sm bg-line dark:bg-dark-bg-hover" />
            <div className="h-4 w-full rounded-sm bg-line dark:bg-dark-bg-hover" />
            <div className="h-5 w-56 rounded-sm bg-line dark:bg-dark-bg-hover" />
            <div className="h-4 w-40 rounded-sm bg-line dark:bg-dark-bg-hover" />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4 shadow-xs sm:p-8 dark:border-dark-border dark:bg-dark-bg">
          <div className="mb-8 space-y-3">
            <div className="h-4 w-16 rounded-sm bg-line dark:bg-dark-bg-hover" />
            <div className="h-10 w-48 rounded-sm bg-line dark:bg-dark-bg-hover" />
          </div>
          <div className="mb-8 space-y-3">
            <div className="h-4 w-16 rounded-sm bg-line dark:bg-dark-bg-hover" />
            <div className="h-15 w-full rounded-sm bg-line dark:bg-dark-bg-hover" />
          </div>
          <div className="mb-8 space-y-3">
            <div className="h-4 w-16 rounded-sm bg-line dark:bg-dark-bg-hover" />
            <div className="h-30 w-full rounded-sm bg-line dark:bg-dark-bg-hover" />
          </div>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <div className="h-15 flex-1 rounded-sm bg-line dark:bg-dark-bg-hover" />
            <div className="h-15 flex-1 rounded-sm bg-line dark:bg-dark-bg-hover" />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
