'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';

import { IconTrash } from '@tabler/icons-react';
import { useIsMutating } from '@tanstack/react-query';

import { MyPageScrollArea, MyPageSectionHeader } from '@features/my/ui';
import { ProductItem } from '@features/product/ui';

import { ProductCard } from '@entities/product/ui';
import type { WishlistItem } from '@entities/wishlist/model/types';
import { wishlistQueryKeys } from '@entities/wishlist/queries/queryKeys';
import { useClearWishlist } from '@entities/wishlist/queries/useClearWishlist';
import { useSuspenseWishlist } from '@entities/wishlist/queries/useWishlist';

import MyPageEmptyRecommendedProducts from '@widgets/my-page-empty/ui/MyPageEmptyRecommendedProducts';
import MyPageEmptyStatePanel from '@widgets/my-page-empty/ui/MyPageEmptyStatePanel';

import MyWishlistPagination from './MyWishlistPagination';

const mapWishlistItemToProduct = (item: WishlistItem) => ({
  id: item.id,
  name_en: item.name ?? item.alt,
  description: item.description ?? '',
  productLine: item.productLine,
  price: item.price,
  priceLabel: item.priceLabel,
  href: item.href,
  image_url: item.image_url,
  ProductImage:
    item.ProductImage && item.ProductImage.length > 0
      ? item.ProductImage
      : [{ image_url: item.image_url }],
  category: item.category,
  productColor: item.productColor ?? [],
});

const WISHLIST_PAGE_SIZE = 6;
const WISHLIST_PAGE_WINDOW_SIZE = 5;

const getWishlistPaginationPages = (
  currentPage: number,
  totalPages: number,
) => {
  const halfWindow = Math.floor(WISHLIST_PAGE_WINDOW_SIZE / 2);
  const maxStartPage = Math.max(1, totalPages - WISHLIST_PAGE_WINDOW_SIZE + 1);
  const startPage = Math.min(
    Math.max(1, currentPage - halfWindow),
    maxStartPage,
  );
  const endPage = Math.min(
    totalPages,
    startPage + WISHLIST_PAGE_WINDOW_SIZE - 1,
  );

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  );
};

export default function MyWishlistContent() {
  const listTopRef = useRef<HTMLDivElement | null>(null);
  const { data: wishlistItems = [] } = useSuspenseWishlist();
  const upsertingWishlistCount = useIsMutating({
    mutationKey: wishlistQueryKeys.upsertMutation(),
  });
  const { mutate: clearWishlist, isPending: isClearingWishlist } =
    useClearWishlist();
  const [currentPage, setCurrentPage] = useState(1);
  const [wasEmptyBeforeUpsert, setWasEmptyBeforeUpsert] = useState(
    wishlistItems.length === 0,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(wishlistItems.length / WISHLIST_PAGE_SIZE),
  );
  const pageNumbers = getWishlistPaginationPages(currentPage, totalPages);
  const visibleWishlistItems = useMemo(
    () =>
      wishlistItems.slice(
        (currentPage - 1) * WISHLIST_PAGE_SIZE,
        currentPage * WISHLIST_PAGE_SIZE,
      ),
    [currentPage, wishlistItems],
  );
  const shouldShowEmptyState =
    wishlistItems.length === 0 ||
    (upsertingWishlistCount > 0 && wasEmptyBeforeUpsert);

  const handlePageChange = (page: number) => {
    if (
      page === currentPage ||
      page < 1 ||
      page > totalPages ||
      isClearingWishlist
    ) {
      return;
    }

    setCurrentPage(page);

    window.requestAnimationFrame(() => {
      listTopRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (upsertingWishlistCount > 0) {
      return;
    }

    setWasEmptyBeforeUpsert(wishlistItems.length === 0);
  }, [upsertingWishlistCount, wishlistItems.length]);

  return (
    <div className="w-full rounded-2xl lg:pl-4 dark:border-dark-border dark:bg-dark-bg">
      <MyPageSectionHeader
        label="WISHLIST"
        title="찜한 상품"
        description={`총 ${wishlistItems.length}개의 상품을 찜했습니다.`}
        action={
          wishlistItems.length > 0 ? (
            <button
              type="button"
              onClick={() => clearWishlist()}
              disabled={isClearingWishlist}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-muted transition-colors hover:bg-canvas dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted dark:hover:bg-dark-bg-hover"
            >
              <IconTrash size={16} />
              전체 삭제
            </button>
          ) : null
        }
      />

      <MyPageScrollArea ref={listTopRef} className="scroll-mt-28">
        {shouldShowEmptyState ? (
          <>
            <MyPageEmptyStatePanel
              title="찜한 상품이 없어요"
              description="관심 있는 상품을 모아두면 나중에 빠르게 다시 확인할 수 있습니다."
              iconVariant="wishlist"
              layout="horizontal"
              action={
                <Link
                  href="/products"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-surface shadow-[0_14px_26px_-18px_rgba(37,99,235,0.75)] transition-colors hover:bg-primary-hover"
                >
                  추천 상품 보기
                </Link>
              }
            />
            <div className="mt-4">
              <MyPageEmptyRecommendedProducts
                title="찜하기 좋은 상품"
                context="wishlist-empty"
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-5 xl:grid-cols-3">
              {visibleWishlistItems.map((item, index) => (
                <ProductCard key={item.id} width="w-full">
                  <ProductItem
                    product={mapWishlistItemToProduct(item)}
                    variant="catalog"
                    priorityImage={index < 3}
                  />
                </ProductCard>
              ))}
            </div>
          </>
        )}
      </MyPageScrollArea>

      <MyWishlistPagination
        totalPages={totalPages}
        currentPage={currentPage}
        pageNumbers={pageNumbers}
        disabled={isClearingWishlist}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
