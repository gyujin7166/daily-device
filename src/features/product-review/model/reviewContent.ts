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
  label: string;
}[] = [
  { value: 'latest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'rating_desc', label: '평점 높은순' },
  { value: 'rating_asc', label: '평점 낮은순' },
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
