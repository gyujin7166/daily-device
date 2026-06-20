'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { IconArrowUp } from '@tabler/icons-react';

import {
  PRODUCT_GRID_PAGE_SIZE,
  PRODUCT_PAGE_SIZE,
} from '@entities/product/constants/pagination';
import type { CatalogProductItem } from '@entities/product/model/types';
import { ProductCard, ProductSkeleton } from '@entities/product/ui';

import { cn } from '@shared/lib/utils/style';
import Spinner from '@shared/ui/Loading/Spinner/Spinner';

import ProductItem from './ProductItem';

const AUTO_LOAD_COOLDOWN_MS = 700;
const AUTO_LOAD_SCROLL_ADVANCE_PX = 240;
const AUTO_LOAD_SCROLL_RESTORE_RATIO = 0.32;
const AUTO_LOAD_SCROLL_RESTORE_MIN_PX = 220;
const AUTO_LOAD_SCROLL_RESTORE_MAX_PX = 380;
const AUTO_LOAD_BOTTOM_DISTANCE_PX = 160;
const BACK_TO_TOP_VISIBILITY_SCROLL_Y = 720;
const BACK_TO_TOP_BUTTON_SIZE_PX = 44;
const BACK_TO_TOP_SIDE_GAP_PX = 16;
const BACK_TO_TOP_VIEWPORT_GAP_PX = 20;
const BACK_TO_TOP_INLINE_BREAKPOINT_PX = 480;

type SettleAutoLoadRequestOptions = {
  restoreScroll?: boolean;
};

type ProductListProps = {
  products: CatalogProductItem[];
  isPending: boolean;
  columns?: 'three' | 'four';
  totalCount?: number;
  hasNextPage?: boolean;
  fetchNextPage?: () => void | Promise<void>;
  isFetchingNextPage?: boolean;
  isRefreshing?: boolean;
  resetKey?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
};

const getAutoLoadScrollRestoreDistance = () =>
  Math.min(
    AUTO_LOAD_SCROLL_RESTORE_MAX_PX,
    Math.max(
      AUTO_LOAD_SCROLL_RESTORE_MIN_PX,
      window.innerHeight * AUTO_LOAD_SCROLL_RESTORE_RATIO,
    ),
  );

const getMaxWindowScrollY = () =>
  Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

export default function ProductList({
  products,
  isPending,
  columns = 'three',
  totalCount = 0,
  hasNextPage = false,
  fetchNextPage,
  isFetchingNextPage = false,
  isRefreshing = false,
  resetKey,
  emptyTitle = '표시할 상품이 없습니다.',
  emptyDescription = '잠시 후 다시 시도해 주세요.',
  emptyAction,
}: ProductListProps) {
  const gridClassName =
    columns === 'four'
      ? 'grid grid-cols-2 items-stretch gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4'
      : 'grid grid-cols-2 items-stretch gap-3 sm:gap-5 xl:grid-cols-3';
  const skeletonColumns = columns === 'four' ? 'four' : 'three';
  const pageSize =
    columns === 'four' ? PRODUCT_GRID_PAGE_SIZE : PRODUCT_PAGE_SIZE;
  const autoLoadBatchSize = pageSize * 5;
  const shownCount = products.length;
  const effectiveTotal = Math.max(totalCount, shownCount);
  const progressPercent = effectiveTotal
    ? (shownCount / effectiveTotal) * 100
    : 0;
  const canLoadMore = hasNextPage && shownCount < effectiveTotal;
  const remainingCount = Math.max(effectiveTotal - shownCount, 0);
  const nextSkeletonCount = Math.min(pageSize, remainingCount);
  const [autoLoadLimit, setAutoLoadLimit] = useState(autoLoadBatchSize);
  const canAutoLoadMore = canLoadMore && shownCount < autoLoadLimit;
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [backToTopRight, setBackToTopRight] = useState(
    BACK_TO_TOP_VIEWPORT_GAP_PX,
  );
  const [showAppendSkeleton, setShowAppendSkeleton] = useState(false);
  const shouldShowLoadMoreButton =
    canLoadMore &&
    !canAutoLoadMore &&
    !isFetchingNextPage &&
    !showAppendSkeleton;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const productListRef = useRef<HTMLDivElement | null>(null);
  const isRequestingNextPageRef = useRef(false);
  const lastAutoFetchAtRef = useRef(0);
  const nextAutoLoadMinScrollYRef = useRef(0);
  const appendRequestedShownCountRef = useRef(0);
  const hasUserScrolledSinceResetRef = useRef(false);
  const autoLoadRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const shouldShowAppendSkeleton =
    (isFetchingNextPage || showAppendSkeleton) && nextSkeletonCount > 0;

  const clearAutoLoadRetryTimer = useCallback(() => {
    if (!autoLoadRetryTimerRef.current) {
      return;
    }

    clearTimeout(autoLoadRetryTimerRef.current);
    autoLoadRetryTimerRef.current = null;
  }, []);

  const settleAutoLoadRequest = useCallback(
    ({ restoreScroll = false }: SettleAutoLoadRequestOptions = {}) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const target = loadMoreRef.current;
          const targetTop =
            target?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;

          if (restoreScroll && targetTop < window.innerHeight * 0.85) {
            window.scrollBy({
              top: -getAutoLoadScrollRestoreDistance(),
              behavior: 'auto',
            });
          }

          nextAutoLoadMinScrollYRef.current = Math.min(
            window.scrollY + AUTO_LOAD_SCROLL_ADVANCE_PX,
            getMaxWindowScrollY(),
          );
          isRequestingNextPageRef.current = false;
        });
      });
    },
    [],
  );

  const fetchNextPageAndSettle = useCallback(
    (options?: SettleAutoLoadRequestOptions) => {
      if (!fetchNextPage) {
        return;
      }

      appendRequestedShownCountRef.current = shownCount;
      setShowAppendSkeleton(true);

      void Promise.resolve(fetchNextPage()).finally(() => {
        settleAutoLoadRequest(options);
      });
    },
    [fetchNextPage, settleAutoLoadRequest, shownCount],
  );

  useEffect(() => {
    if (shownCount <= autoLoadLimit) {
      return;
    }

    setAutoLoadLimit(
      Math.ceil(shownCount / autoLoadBatchSize) * autoLoadBatchSize,
    );
  }, [autoLoadBatchSize, autoLoadLimit, shownCount]);

  useEffect(() => {
    setAutoLoadLimit(autoLoadBatchSize);
    lastAutoFetchAtRef.current = 0;
    nextAutoLoadMinScrollYRef.current = Math.min(
      window.scrollY + AUTO_LOAD_SCROLL_ADVANCE_PX,
      getMaxWindowScrollY(),
    );
    isRequestingNextPageRef.current = false;
    appendRequestedShownCountRef.current = 0;
    hasUserScrolledSinceResetRef.current = false;
    clearAutoLoadRetryTimer();
    setShowAppendSkeleton(false);
  }, [autoLoadBatchSize, clearAutoLoadRetryTimer, resetKey]);

  useEffect(() => {
    if (!showAppendSkeleton || isFetchingNextPage) {
      return;
    }

    const didAppendProducts = shownCount > appendRequestedShownCountRef.current;
    const cannotAppendMore = !canLoadMore;

    if (!didAppendProducts && !cannotAppendMore) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setShowAppendSkeleton(false);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [canLoadMore, isFetchingNextPage, showAppendSkeleton, shownCount]);

  useEffect(() => {
    let scrollFrame = 0;

    const updateBackToTopVisibility = () => {
      scrollFrame = 0;
      setShowBackToTop(window.scrollY > BACK_TO_TOP_VISIBILITY_SCROLL_Y);
    };

    const handleScroll = () => {
      if (scrollFrame) {
        return;
      }

      scrollFrame = requestAnimationFrame(updateBackToTopVisibility);
    };

    updateBackToTopVisibility();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollFrame) {
        cancelAnimationFrame(scrollFrame);
      }
    };
  }, []);

  useEffect(() => {
    const updateBackToTopPosition = () => {
      const target = productListRef.current;

      if (!target || window.innerWidth < BACK_TO_TOP_INLINE_BREAKPOINT_PX) {
        setBackToTopRight(BACK_TO_TOP_VIEWPORT_GAP_PX);
        return;
      }

      const rect = target.getBoundingClientRect();
      const preferredLeft = rect.right + BACK_TO_TOP_SIDE_GAP_PX;
      const maxLeft =
        window.innerWidth -
        BACK_TO_TOP_VIEWPORT_GAP_PX -
        BACK_TO_TOP_BUTTON_SIZE_PX;
      const left = Math.min(preferredLeft, maxLeft);

      setBackToTopRight(window.innerWidth - left - BACK_TO_TOP_BUTTON_SIZE_PX);
    };

    updateBackToTopPosition();
    window.addEventListener('resize', updateBackToTopPosition);

    const resizeObserver = new ResizeObserver(updateBackToTopPosition);
    if (productListRef.current) {
      resizeObserver.observe(productListRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateBackToTopPosition);
      resizeObserver.disconnect();
    };
  }, [products.length, columns]);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (
      !target ||
      !canAutoLoadMore ||
      !fetchNextPage ||
      isPending ||
      isFetchingNextPage ||
      showAppendSkeleton
    ) {
      return;
    }

    const tryFetchNextPage = () => {
      const rect = target.getBoundingClientRect();
      const distanceFromDocumentBottom =
        document.documentElement.scrollHeight -
        (window.scrollY + window.innerHeight);
      const isNearViewport =
        rect.top <= window.innerHeight + 1000 && rect.bottom >= -1000;
      const isNearDocumentBottom =
        distanceFromDocumentBottom <= AUTO_LOAD_BOTTOM_DISTANCE_PX;
      const didReachListByScroll =
        hasUserScrolledSinceResetRef.current || window.scrollY > 0;

      if (!didReachListByScroll || isRequestingNextPageRef.current) {
        return;
      }

      if (!isNearViewport && !isNearDocumentBottom) {
        return;
      }

      if (
        !isNearDocumentBottom &&
        window.scrollY < nextAutoLoadMinScrollYRef.current
      ) {
        return;
      }

      const now = Date.now();
      const elapsedSinceLastFetch = now - lastAutoFetchAtRef.current;
      if (elapsedSinceLastFetch < AUTO_LOAD_COOLDOWN_MS) {
        if (isNearDocumentBottom && !autoLoadRetryTimerRef.current) {
          autoLoadRetryTimerRef.current = setTimeout(() => {
            autoLoadRetryTimerRef.current = null;
            tryFetchNextPage();
          }, AUTO_LOAD_COOLDOWN_MS - elapsedSinceLastFetch);
        }

        return;
      }

      clearAutoLoadRetryTimer();
      lastAutoFetchAtRef.current = now;
      isRequestingNextPageRef.current = true;
      fetchNextPageAndSettle({ restoreScroll: true });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          tryFetchNextPage();
        }
      },
      {
        rootMargin: '1000px 0px',
        threshold: 0.01,
      },
    );

    observer.observe(target);
    const initialCheckFrame = requestAnimationFrame(tryFetchNextPage);
    const delayedCheckTimer = setTimeout(tryFetchNextPage, 120);

    let scrollFrame = 0;
    const handleScroll = () => {
      hasUserScrolledSinceResetRef.current = true;

      if (scrollFrame) {
        return;
      }

      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        tryFetchNextPage();
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearAutoLoadRetryTimer();
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(initialCheckFrame);
      clearTimeout(delayedCheckTimer);
      if (scrollFrame) {
        cancelAnimationFrame(scrollFrame);
      }
    };
  }, [
    canAutoLoadMore,
    clearAutoLoadRetryTimer,
    fetchNextPage,
    fetchNextPageAndSettle,
    isFetchingNextPage,
    isPending,
    showAppendSkeleton,
    shownCount,
  ]);

  const handleResumeAutoLoad = () => {
    setAutoLoadLimit((prevLimit) => prevLimit + autoLoadBatchSize);

    if (
      !fetchNextPage ||
      !canLoadMore ||
      isFetchingNextPage ||
      showAppendSkeleton ||
      isRequestingNextPageRef.current
    ) {
      return;
    }

    isRequestingNextPageRef.current = true;
    lastAutoFetchAtRef.current = Date.now();
    fetchNextPageAndSettle();
  };

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (isPending) {
    return (
      <ProductSkeleton
        variant="product"
        columns={skeletonColumns}
        length={pageSize}
      />
    );
  }

  if (products.length === 0) {
    return (
      <div
        className="relative flex min-h-[clamp(260px,38vh,420px)] w-full items-center justify-center px-6 text-center"
        aria-busy={isRefreshing}
      >
        <div className="max-w-sm">
          <p className="text-base font-semibold text-ink dark:text-surface">
            {emptyTitle}
          </p>
          <p className="mt-2 text-sm text-muted dark:text-dark-muted">
            {emptyDescription}
          </p>
          {emptyAction}
        </div>
        {isRefreshing ? <ProductListRefreshingOverlay /> : null}
      </div>
    );
  }

  return (
    <div ref={productListRef} className="w-full">
      <div className="relative" aria-busy={isRefreshing}>
        <div
          className={cn(
            gridClassName,
            'transition-opacity duration-150',
            isRefreshing
              ? 'pointer-events-none select-none opacity-55'
              : 'opacity-100',
          )}
        >
          {products.map((item, index) => (
            <ProductCard key={item.id} width="w-full">
              <ProductItem
                product={item}
                variant="catalog"
                priorityImage={index < 3}
              />
            </ProductCard>
          ))}
        </div>
        {isRefreshing ? <ProductListRefreshingOverlay /> : null}
      </div>

      {shouldShowAppendSkeleton ? (
        <div className="mt-5">
          <ProductSkeleton
            variant="product"
            columns={skeletonColumns}
            length={nextSkeletonCount}
          />
        </div>
      ) : null}

      <div className="mt-10 flex flex-col items-center">
        <p className="text-sm text-muted dark:text-dark-muted">
          총 {effectiveTotal}개 중 {shownCount}개 표시
        </p>
        <div className="mt-3 h-1.5 w-40 overflow-hidden rounded-full bg-line dark:bg-dark-bg-hover">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {shouldShowLoadMoreButton ? (
          <button
            type="button"
            onClick={handleResumeAutoLoad}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-line bg-surface px-8 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border dark:bg-dark-panel dark:text-primary dark:hover:bg-primary-soft"
          >
            더보기
          </button>
        ) : null}
        <div
          ref={loadMoreRef}
          aria-hidden
          className={canAutoLoadMore ? 'h-16 w-full' : 'h-4 w-full'}
        />
      </div>

      <button
        type="button"
        aria-label="최상단으로 이동"
        onClick={handleBackToTop}
        className={`fixed bottom-24 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-canvas focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/30 sm:bottom-8 dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover ${
          showBackToTop
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-3 opacity-0'
        }`}
        style={{ right: backToTopRight }}
      >
        <IconArrowUp size={20} stroke={2.4} />
      </button>
    </div>
  );
}

function ProductListRefreshingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex justify-center">
      <div className="sticky top-[50vh] inline-flex size-14 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/95 shadow-lg backdrop-blur-sm dark:border-dark-border dark:bg-dark-panel/95">
        <Spinner size="sm" />
        <span className="sr-only">상품 목록을 불러오는 중</span>
      </div>
    </div>
  );
}
