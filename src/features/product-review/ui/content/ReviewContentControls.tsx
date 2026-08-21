import { useFormatter, useTranslations } from 'next-intl';

import type { ProductReviewSortOption } from '@entities/review/model/sort';

import { cn } from '@shared/lib/utils/style';
import SortDropdown from '@shared/ui/SortDropdown';

import { REVIEW_SORT_OPTIONS } from '../../model/reviewContent';

import type { ReviewFilter } from '../../model/reviewContent';

type ReviewContentControlsProps = {
  reviewFilter: ReviewFilter;
  sortOption: ProductReviewSortOption;
  isSorting: boolean;
  isRefreshing: boolean;
  shouldShowSkeleton: boolean;
  safeTotalItems: number;
  showingStart: number;
  showingEnd: number;
  onFilterChange?: (nextFilter: ReviewFilter) => void;
  onSortChange?: (nextSort: ProductReviewSortOption) => void;
};

export default function ReviewContentControls({
  reviewFilter,
  sortOption,
  isSorting,
  isRefreshing,
  shouldShowSkeleton,
  safeTotalItems,
  showingStart,
  showingEnd,
  onFilterChange,
  onSortChange,
}: ReviewContentControlsProps) {
  const t = useTranslations('ProductReview');
  const format = useFormatter();
  const sortOptions = REVIEW_SORT_OPTIONS.map((option) => ({
    value: option.value,
    label: t(`sort.${option.labelKey}`),
  }));
  const rangeText = t(
    reviewFilter === 'with_images'
      ? 'filters.rangeWithImages'
      : 'filters.rangeAll',
    {
      total: format.number(safeTotalItems),
      start: format.number(showingStart),
      end: format.number(showingEnd),
    },
  );

  if (shouldShowSkeleton) {
    return (
      <section className="mt-10 rounded-2xl border border-line bg-surface px-4 py-4 sm:px-5 dark:border-dark-border dark:bg-dark-panel">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="h-10 w-22 animate-pulse rounded-xl border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border" />
            <div className="h-10 w-42 animate-pulse rounded-full border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border" />
          </div>
          <div className="h-4 w-37.5 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'mt-10 rounded-2xl border border-line bg-surface px-4 py-4 transition-opacity duration-200 sm:px-5 dark:border-dark-border dark:bg-dark-panel',
        isRefreshing ? 'opacity-60' : 'opacity-100',
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <SortDropdown<ProductReviewSortOption>
            value={sortOption}
            options={sortOptions}
            onChange={(nextValue) => onSortChange?.(nextValue)}
            disabled={isSorting}
            menuWidthClassName="w-47.5"
          />

          <div className="inline-flex items-center gap-1 rounded-full bg-info-soft p-1 dark:bg-dark-bg-hover">
            <button
              type="button"
              className={cn(
                'h-8 rounded-full px-3 text-sm font-semibold transition-colors',
                reviewFilter === 'all'
                  ? 'bg-primary text-on-primary'
                  : 'text-muted hover:text-ink dark:text-dark-muted dark:hover:text-surface',
              )}
              disabled={isRefreshing}
              onClick={() => onFilterChange?.('all')}
            >
              {t('filters.all')}
            </button>
            <button
              type="button"
              className={cn(
                'h-8 rounded-full px-3 text-sm font-semibold transition-colors',
                reviewFilter === 'with_images'
                  ? 'bg-primary text-on-primary'
                  : 'text-muted hover:text-ink dark:text-dark-muted dark:hover:text-surface',
              )}
              disabled={isRefreshing}
              onClick={() => onFilterChange?.('with_images')}
            >
              {t('filters.withImages')}
            </button>
          </div>
        </div>

        <div className="text-sm text-muted dark:text-dark-muted">
          {rangeText}
        </div>
      </div>
    </section>
  );
}
