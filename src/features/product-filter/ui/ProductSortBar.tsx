import { useTranslations } from 'next-intl';

import type { ProductSortOption } from '@entities/product/model/sort';

import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

import SortControlButton from './SortControlButton';

type ProductSortBarProps = {
  resultCount?: number;
  sortOption: ProductSortOption;
  onSortChange: (nextSort: ProductSortOption) => void;
  isSorting?: boolean;
};

export default function ProductSortBar({
  resultCount = 0,
  sortOption,
  onSortChange,
  isSorting = false,
}: ProductSortBarProps) {
  const t = useTranslations('ProductFilter.summary');

  return (
    <section className="w-full border-b border-line bg-surface text-sm dark:border-dark-border dark:bg-dark-bg">
      <PageWrapper className="flex flex-wrap items-center justify-between gap-3 py-4">
        <p className="text-xs text-muted dark:text-dark-muted">
          {t('resultCount', { count: resultCount })}
        </p>
        <SortControlButton
          sortOption={sortOption}
          onSortChange={onSortChange}
          disabled={isSorting}
        />
      </PageWrapper>
    </section>
  );
}
