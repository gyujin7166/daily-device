import { createRef } from 'react';

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProductReviewsPayload } from '@entities/review/model/types';

import ProductDetailReviewSection from './ProductDetailReviewSection';

type MockProductReviewQueryResult = {
  data: ProductReviewsPayload | undefined;
  isPending: boolean;
  isFetching: boolean;
  isPlaceholderData: boolean;
  isError: boolean;
  refetch: ReturnType<typeof vi.fn>;
};

const mocks = vi.hoisted(() => ({
  queryResult: {} as MockProductReviewQueryResult,
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@entities/review/queries/useProductReviews', () => ({
  useProductReviews: () => mocks.queryResult,
}));

vi.mock('@shared/ui/Pagination/Pagination', () => ({
  default: () => null,
}));

vi.mock('@shared/ui/QueryErrorFallback', () => ({
  default: () => null,
}));

vi.mock('./content/NoReviewProduct', () => ({
  default: () => null,
}));

vi.mock('./content/ReviewContent', () => ({
  default: ({
    isRefreshing,
    isSorting,
  }: {
    isRefreshing: boolean;
    isSorting: boolean;
  }) => (
    <div
      data-testid="review-content"
      data-refreshing={String(isRefreshing)}
      data-sorting={String(isSorting)}
    />
  ),
}));

vi.mock('./content/ReviewContentList', () => ({
  ReviewContentListSkeleton: () => null,
}));

vi.mock('./gallery/ReviewGalleryPreviewSection', () => ({
  default: () => null,
}));

vi.mock('./summary/ProductReviewHeader', () => ({
  default: () => null,
}));

const productReviews: ProductReviewsPayload = {
  items: [],
  totalItems: 12,
  summaryTotalItems: 12,
  totalReviewImageCount: 0,
  averageRating: 4.5,
  ratingCounts: [8, 2, 1, 1, 0],
  totalPages: 2,
  currentPage: 1,
  perPage: 6,
};

const defaultProps = {
  detail: 'keyboard',
  currentPath: '/products/keyboards/keyboard',
  reviewContentTopRef: createRef<HTMLDivElement>(),
  currentPage: 1,
  setCurrentPage: vi.fn(),
  reviewSortOption: 'latest' as const,
  reviewFilter: 'all' as const,
  onReviewSortChange: vi.fn(),
  onReviewFilterChange: vi.fn(),
};

beforeEach(() => {
  mocks.queryResult = {
    data: productReviews,
    isPending: false,
    isFetching: false,
    isPlaceholderData: false,
    isError: false,
    refetch: vi.fn(),
  };
});

describe('ProductDetailReviewSection', () => {
  it('locale 전환으로 기존 데이터를 유지하는 동안에는 상품평을 흐리게 표시하지 않는다', () => {
    const { rerender } = render(
      <ProductDetailReviewSection {...defaultProps} />,
    );

    mocks.queryResult = {
      ...mocks.queryResult,
      isFetching: true,
      isPlaceholderData: true,
    };
    rerender(<ProductDetailReviewSection {...defaultProps} />);

    expect(screen.getByTestId('review-content')).toHaveAttribute(
      'data-refreshing',
      'false',
    );
    expect(screen.getByTestId('review-content')).toHaveAttribute(
      'data-sorting',
      'false',
    );
  });

  it('상품평 페이지를 변경하는 동안에는 기존 상품평을 흐리게 표시한다', () => {
    const { rerender } = render(
      <ProductDetailReviewSection {...defaultProps} />,
    );

    mocks.queryResult = {
      ...mocks.queryResult,
      isFetching: true,
      isPlaceholderData: true,
    };
    rerender(<ProductDetailReviewSection {...defaultProps} currentPage={2} />);

    expect(screen.getByTestId('review-content')).toHaveAttribute(
      'data-refreshing',
      'true',
    );
    expect(screen.getByTestId('review-content')).toHaveAttribute(
      'data-sorting',
      'true',
    );
  });
});
