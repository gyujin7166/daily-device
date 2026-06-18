import React, { useEffect, useMemo, useRef } from 'react';

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import { cn } from '@shared/lib/utils/style';

type PaginationProps = {
  totalItems: number;
  itemsPerPage?: number;
  scrollRef: React.RefObject<HTMLElement | null>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  disabled?: boolean;
};

const DEFAULT_ITEMS_PER_PAGE = 4;
const PAGE_WINDOW_SIZE = 9;

export default function Pagination({
  totalItems,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  scrollRef,
  currentPage,
  setCurrentPage,
  disabled = false,
}: PaginationProps) {
  const shouldScrollOnPageChangeRef = useRef(false);
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const pageNumbers = useMemo(() => {
    const startPage = Math.max(1, safeCurrentPage - 4);
    const endPage = Math.min(totalPages, startPage + PAGE_WINDOW_SIZE - 1);

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index,
    );
  }, [safeCurrentPage, totalPages]);

  const handlePrevious = () => {
    if (disabled) {
      return;
    }

    if (safeCurrentPage > 1) {
      shouldScrollOnPageChangeRef.current = true;
      setCurrentPage(safeCurrentPage - 1);
    }
  };

  const handleNext = () => {
    if (disabled) {
      return;
    }

    if (safeCurrentPage < totalPages) {
      shouldScrollOnPageChangeRef.current = true;
      setCurrentPage(safeCurrentPage + 1);
    }
  };

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage, setCurrentPage]);

  useEffect(() => {
    if (!shouldScrollOnPageChangeRef.current) {
      return;
    }
    shouldScrollOnPageChangeRef.current = false;

    const frameId = window.requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [currentPage, scrollRef]);

  return (
    <div>
      <div className="flex items-center">
        <button
          type="button"
          className="mr-2 flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition hover:bg-line disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-bg-hover"
          onClick={handlePrevious}
          disabled={disabled || safeCurrentPage === 1}
          aria-label="이전 페이지"
        >
          <IconChevronLeft size={22} stroke={1.7} />
        </button>
        {pageNumbers.map((number) => {
          return (
            <div key={number}>
              <button
                type="button"
                onClick={() => {
                  if (disabled) {
                    return;
                  }
                  if (number === safeCurrentPage) {
                    return;
                  }
                  shouldScrollOnPageChangeRef.current = true;
                  setCurrentPage(number);
                }}
                disabled={disabled}
                aria-label={`${number} 페이지로 이동`}
                aria-current={safeCurrentPage === number ? 'page' : undefined}
                className={cn(
                  'mx-1 flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
                  safeCurrentPage === number
                    ? 'border-ink bg-ink text-surface'
                    : 'border-line text-muted hover:bg-line hover:text-ink dark:border-dark-border dark:bg-dark-bg-hover dark:text-dark-muted dark:hover:bg-dark-bg-hover dark:hover:text-surface',
                )}
              >
                <span>{number}</span>
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="ml-2 flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition hover:bg-line disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-bg-hover"
          onClick={handleNext}
          disabled={disabled || safeCurrentPage === totalPages}
          aria-label="다음 페이지"
        >
          <IconChevronRight size={22} stroke={1.7} />
        </button>
      </div>
    </div>
  );
}
