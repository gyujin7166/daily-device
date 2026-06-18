import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import { cn } from '@shared/lib/utils/style';

type MyWishlistPaginationProps = {
  totalPages: number;
  currentPage: number;
  pageNumbers: number[];
  disabled: boolean;
  onPageChange: (page: number) => void;
};

export default function MyWishlistPagination({
  totalPages,
  currentPage,
  pageNumbers,
  disabled,
  onPageChange,
}: MyWishlistPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-2"
      aria-label="찜한 상품 페이지네이션"
    >
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || disabled}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover"
        aria-label="이전 페이지"
      >
        <IconChevronLeft size={18} />
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          disabled={disabled}
          aria-current={currentPage === page ? 'page' : undefined}
          aria-label={`${page} 페이지로 이동`}
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
        disabled={currentPage === totalPages || disabled}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover"
        aria-label="다음 페이지"
      >
        <IconChevronRight size={18} />
      </button>
    </nav>
  );
}
