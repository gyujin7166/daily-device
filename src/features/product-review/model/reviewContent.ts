import type { ProductReviewFilter } from '@entities/review/model/filter';
import type { ProductReviewSortOption } from '@entities/review/model/sort';
import type { ProductReviewsPayload } from '@entities/review/model/types';

export type ReviewFilter = ProductReviewFilter;

export type ReviewContentCardImage = {
  id: string | number;
  image_url: string;
  order?: number | null;
  blur_data_url?: string | null;
};

export type ReviewContentProps = {
  detail: string;
  currentPath: string;
  productReview: ProductReviewsPayload;
  currentPage?: number;
  sortOption?: ProductReviewSortOption;
  reviewFilter?: ReviewFilter;
  onSortChange?: (nextSort: ProductReviewSortOption) => void;
  onFilterChange?: (nextFilter: ReviewFilter) => void;
  isSorting?: boolean;
  isRefreshing?: boolean;
  isLoading?: boolean;
};

export const REVIEW_SORT_OPTIONS: {
  value: ProductReviewSortOption;
  labelKey: 'latest' | 'oldest' | 'ratingDesc' | 'ratingAsc';
}[] = [
  { value: 'latest', labelKey: 'latest' },
  { value: 'oldest', labelKey: 'oldest' },
  { value: 'rating_desc', labelKey: 'ratingDesc' },
  { value: 'rating_asc', labelKey: 'ratingAsc' },
];

export const getReviewShowingRange = ({
  currentPage,
  perPage,
  totalItems,
}: {
  currentPage: number;
  perPage: number;
  totalItems: number;
}) => {
  const safeCurrentPage = Math.max(1, Math.floor(currentPage));
  const safePerPage = Math.max(1, Math.floor(perPage));
  const safeTotalItems = Math.max(0, Math.floor(totalItems));

  return {
    safeCurrentPage,
    safePerPage,
    safeTotalItems,
    showingStart:
      safeTotalItems > 0 ? (safeCurrentPage - 1) * safePerPage + 1 : 0,
    showingEnd:
      safeTotalItems > 0
        ? Math.min(safeCurrentPage * safePerPage, safeTotalItems)
        : 0,
  };
};
