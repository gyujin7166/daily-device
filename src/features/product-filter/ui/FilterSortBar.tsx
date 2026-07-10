import { useTranslations } from 'next-intl';

import type { ProductSortOption } from '@entities/product/model/sort';

import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

import FilterToggleButton from './FilterToggleButton';
import SortControlButton from './SortControlButton';

type FilterSortBarProps = {
  resultCount?: number;
  visibleFilter: boolean;
  onToggleFilter: () => void;
  sortOption: ProductSortOption;
  onSortChange: (nextSort: ProductSortOption) => void;
  isSorting?: boolean;
};

export default function FilterSortBar({
  resultCount = 0,
  visibleFilter,
  onToggleFilter,
  sortOption,
  onSortChange,
  isSorting = false,
}: FilterSortBarProps) {
  const t = useTranslations('ProductFilter.summary');

  return (
    <section className="w-full border-b border-line bg-surface text-sm dark:border-dark-border dark:bg-dark-bg">
      <PageWrapper className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="flex items-center gap-3">
          <FilterToggleButton
            visibleFilter={visibleFilter}
            onToggleFilter={onToggleFilter}
          />
          <p className="text-xs text-muted dark:text-dark-muted">
            {t('resultCount', { count: resultCount })}
          </p>
        </div>
        <SortControlButton
          sortOption={sortOption}
          onSortChange={onSortChange}
          disabled={isSorting}
        />
      </PageWrapper>
    </section>
  );
}
