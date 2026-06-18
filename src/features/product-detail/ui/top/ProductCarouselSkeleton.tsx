export default function ProductCarouselSkeleton() {
  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-[28px] bg-line dark:bg-dark-bg-hover">
        <div className="aspect-square w-full animate-pulse bg-line dark:bg-dark-bg-hover" />
      </div>

      <div className="mt-4 overflow-hidden pt-1">
        <div className="flex gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="min-w-0 flex-[0_0_auto]">
              <div className="relative rounded-xl border-2 border-line bg-line dark:border-dark-border dark:bg-dark-bg-hover">
                <div className="block w-22 aspect-square animate-pulse rounded-[10px] bg-line dark:bg-dark-bg-hover sm:w-26" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
