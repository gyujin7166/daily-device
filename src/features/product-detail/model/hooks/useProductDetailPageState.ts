import { useEffect, useMemo, useRef, useState } from 'react';

import { getProductThumbnailUrlBySelectedColor } from '@entities/product/model/productImages';
import type { ProductDetailResponse } from '@entities/product/model/types';
import type { ProductImageItem } from '@entities/product/model/types';
import type { ProductReviewFilter } from '@entities/review/model/filter';
import type { ProductReviewSortOption } from '@entities/review/model/sort';

import { IMAGE_FALLBACK_URL } from '@shared/constants/images';

import {
  createRecentlyViewedItem,
  getNextRecentlyViewedItems,
  parseRecentlyViewedItems,
  RECENTLY_VIEWED_STORAGE_KEY,
  RECENTLY_VIEWED_VISIBLE_LIMIT,
} from '../recentlyViewedProducts';

import type { CarouselProductItem } from '../recentlyViewedProducts';

type UseProductDetailPageStateParams = {
  product: ProductDetailResponse['product'];
  mainImageUrl?: string;
  productImages?: ProductImageItem[];
  currentPath: string;
};

export default function useProductDetailPageState({
  product,
  mainImageUrl,
  productImages,
  currentPath,
}: UseProductDetailPageStateParams) {
  const carouselColumnRef = useRef<HTMLDivElement | null>(null);
  const reviewContentTopRef = useRef<HTMLDivElement | null>(null);
  const [carouselBaseHeight, setCarouselBaseHeight] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewSortOption, setReviewSortOption] =
    useState<ProductReviewSortOption>('latest');
  const [reviewFilter, setReviewFilter] = useState<ProductReviewFilter>('all');
  const [recentlyViewed, setRecentlyViewed] = useState<CarouselProductItem[]>(
    [],
  );

  const visibleRecentlyViewed = useMemo(
    () =>
      recentlyViewed
        .filter((item) => item.id !== product?.id)
        .slice(0, RECENTLY_VIEWED_VISIBLE_LIMIT),
    [product?.id, recentlyViewed],
  );
  const defaultColorId =
    product?.productColor.find((item) => item.isDefault)?.id ??
    product?.productColor[0]?.id;
  const recentlyViewedImageUrl =
    getProductThumbnailUrlBySelectedColor(productImages, defaultColorId) ??
    mainImageUrl ??
    IMAGE_FALLBACK_URL;

  const handleReviewSortChange = (nextSort: ProductReviewSortOption) => {
    setCurrentPage(1);
    setReviewSortOption(nextSort);
  };

  const handleReviewFilterChange = (nextFilter: ProductReviewFilter) => {
    setCurrentPage(1);
    setReviewFilter(nextFilter);
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    setRecentlyViewed(parseRecentlyViewedItems(stored));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!product || !product.id || !product.name_en) {
      return;
    }

    const nextItem = createRecentlyViewedItem(
      product,
      recentlyViewedImageUrl,
      currentPath,
      productImages,
    );
    const stored = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    const normalizedItems = parseRecentlyViewedItems(stored);
    const nextItems = getNextRecentlyViewedItems(normalizedItems, nextItem);

    window.localStorage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify(nextItems),
    );
    setRecentlyViewed(nextItems);
  }, [currentPath, product, productImages, recentlyViewedImageUrl]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const node = carouselColumnRef.current;
    if (!node) {
      return;
    }

    const desktopMediaQuery = window.matchMedia('(min-width: 1024px)');
    const updateHeight = () => {
      if (!desktopMediaQuery.matches) {
        setCarouselBaseHeight(0);
        return;
      }

      const nextHeight = Math.round(node.getBoundingClientRect().height);
      setCarouselBaseHeight(nextHeight);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });
    resizeObserver.observe(node);

    const handleViewportChange = () => {
      updateHeight();
    };

    desktopMediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      resizeObserver.disconnect();
      desktopMediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, []);

  return {
    carouselColumnRef,
    reviewContentTopRef,
    carouselBaseHeight,
    currentPage,
    setCurrentPage,
    reviewSortOption,
    reviewFilter,
    handleReviewSortChange,
    handleReviewFilterChange,
    visibleRecentlyViewed,
  };
}
