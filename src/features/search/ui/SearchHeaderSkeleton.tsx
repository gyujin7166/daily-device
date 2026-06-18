export default function SearchHeaderSkeleton() {
  return (
    <div className="mb-10">
      <div className="mb-2 flex flex-wrap items-end gap-x-4 gap-y-2">
        <div className="h-9 w-80 bg-line rounded-sm animate-pulse sm:h-10 sm:w-90 dark:bg-dark-bg-hover" />
        <div className="h-5 w-24 bg-line rounded-sm animate-pulse dark:bg-dark-bg-hover" />
      </div>
      <div className="mt-2 h-5 w-62.5 bg-line rounded-sm animate-pulse sm:w-70 dark:bg-dark-bg-hover" />
    </div>
  );
}
