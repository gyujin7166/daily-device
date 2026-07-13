import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { cn } from '@shared/lib/utils/style';

type MyOrdersPaginationProps = {
  totalPages: number;
  currentPage: number;
  pageNumbers: number[];
  isFetching: boolean;
  onPageChange: (page: number) => void;
};

export default function MyOrdersPagination({
  totalPages,
  currentPage,
  pageNumbers,
  isFetching,
  onPageChange,
}: MyOrdersPaginationProps) {
  const t = useTranslations('MyOrders.labels');

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || isFetching}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover"
        aria-label={t('previousPage')}
      >
        <IconChevronLeft size={18} />
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          disabled={isFetching}
          className={cn(
            'inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition-colors',
            currentPage === page
              ? 'border-primary bg-primary text-surface'
              : 'border-line bg-surface text-ink hover:bg-canvas dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || isFetching}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover"
        aria-label={t('nextPage')}
      >
        <IconChevronRight size={18} />
      </button>
    </div>
  );
}
