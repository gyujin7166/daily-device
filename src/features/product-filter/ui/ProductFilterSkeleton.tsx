import type { ReactNode } from 'react';

type ProductFilterSkeletonProps = {
  className?: string;
  colorRows?: number;
};

const skeletonClassName =
  'animate-pulse rounded-sm bg-line dark:bg-dark-bg-hover';
const optionRows = {
  color: 'space-y-2 pt-3',
  filter: 'pt-3',
};

export default function ProductFilterSkeleton({
  className,
  colorRows = 6,
}: ProductFilterSkeletonProps) {
  return (
    <div className={`w-full space-y-4 ${className ?? ''}`}>
      <ProductFilterSkeletonCard className="min-h-33">
        <div className="mb-4 flex items-center justify-between">
          <div className={`h-3.5 w-10 ${skeletonClassName}`} />
          <div className={`h-3 w-3 ${skeletonClassName}`} />
        </div>
        <div className="pt-3">
          <div className={`mb-2 h-5 w-[72%] ${skeletonClassName}`} />
        </div>
        <div className="relative h-11">
          <div className="relative h-full">
            <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-line dark:bg-dark-border" />
            <div className="absolute left-0 right-0 top-1/2 h-2 animate-pulse -translate-y-1/2 rounded-full bg-line/90 dark:bg-dark-bg-hover" />
            <div className="absolute left-0 top-1/2 size-6 animate-pulse -translate-y-1/2 rounded-full bg-line dark:bg-dark-bg-hover" />
            <div className="absolute right-0 top-1/2 size-6 animate-pulse -translate-y-1/2 rounded-full bg-line dark:bg-dark-bg-hover" />
          </div>
        </div>
        <div className="mt-1 flex items-center justify-between px-1">
          <div className={`h-3 w-8 ${skeletonClassName}`} />
          <div className={`h-3 w-8 ${skeletonClassName}`} />
        </div>
      </ProductFilterSkeletonCard>

      <ProductFilterOptionSkeleton rows={Math.max(colorRows, 1)} type="color" />
      <ProductFilterOptionSkeleton rows={3} />
      <ProductFilterOptionSkeleton rows={3} />
    </div>
  );
}

function ProductFilterSkeletonCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-line bg-surface p-5 shadow-xs dark:border-dark-border dark:bg-dark-panel ${className}`}
    >
      {children}
    </div>
  );
}

function ProductFilterOptionSkeleton({
  rows,
  type = 'filter',
}: {
  rows: number;
  type?: 'color' | 'filter';
}) {
  return (
    <ProductFilterSkeletonCard>
      <div className="flex items-center justify-between">
        <div className={`h-3.5 w-16 ${skeletonClassName}`} />
        <div className={`h-3 w-3 ${skeletonClassName}`} />
      </div>
      <div className={optionRows[type]}>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className={
              type === 'color'
                ? 'flex items-center gap-3 rounded-2xl py-1.5'
                : 'flex items-center py-1.5'
            }
          >
            <div className="size-5 animate-pulse rounded-full bg-line/90 dark:bg-dark-bg-hover" />
            <div
              className={`h-3.5 ${type === 'filter' ? 'ml-2' : ''} ${skeletonClassName}`}
              style={{ width: `${index % 2 === 0 ? 62 : 48}%` }}
            />
          </div>
        ))}
      </div>
    </ProductFilterSkeletonCard>
  );
}
