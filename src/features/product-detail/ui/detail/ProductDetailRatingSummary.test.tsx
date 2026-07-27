import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import type { ProductReviewsPayload } from '@entities/review/model/types';

import { TEST_API_URL } from '../../../../../test/mocks/handlers';
import { server } from '../../../../../test/mocks/server';
import { createTestQueryClient } from '../../../../../test/render';

import ProductDetailRatingSummary from './ProductDetailRatingSummary';

vi.mock('next/navigation', () => ({
  useParams: () => ({ detail: 'keyboard' }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
}));

const messages = {
  ProductDetail: {
    rating: {
      ariaLabel: 'Rating {rating}, {count} reviews',
      reviewCount: '{count} reviews',
    },
  },
};

const createReviewPayload = (
  summaryTotalItems: number,
  averageRating: number,
): ProductReviewsPayload => ({
  items: [],
  totalItems: summaryTotalItems,
  summaryTotalItems,
  totalReviewImageCount: 0,
  averageRating,
  ratingCounts: [0, 0, 0, 0, 0],
  totalPages: 1,
  currentPage: 1,
  perPage: 6,
});

describe('ProductDetailRatingSummary', () => {
  it('locale 전환 중에는 기존 별점 요약을 유지한다', async () => {
    let resolveEnglishRequest: (() => void) | undefined;
    const englishRequest = new Promise<void>((resolve) => {
      resolveEnglishRequest = resolve;
    });

    server.use(
      http.get(`${TEST_API_URL}/api/product-reviews`, async ({ request }) => {
        const locale = new URL(request.url).searchParams.get('locale');

        if (locale === 'en') {
          await englishRequest;
          return HttpResponse.json({
            items: createReviewPayload(20, 4),
            message: 'Success',
          });
        }

        return HttpResponse.json({
          items: createReviewPayload(12, 4.5),
          message: 'Success',
        });
      }),
    );

    const queryClient = createTestQueryClient();
    const renderRating = (locale: string) => (
      <NextIntlClientProvider locale={locale} messages={messages}>
        <QueryClientProvider client={queryClient}>
          <ProductDetailRatingSummary detail="keyboard" />
        </QueryClientProvider>
      </NextIntlClientProvider>
    );
    const { container, rerender } = render(renderRating('ko'));

    expect(await screen.findByText('12 reviews')).toBeInTheDocument();

    rerender(renderRating('en'));

    expect(screen.getByText('12 reviews')).toBeInTheDocument();
    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();

    resolveEnglishRequest?.();

    expect(await screen.findByText('20 reviews')).toBeInTheDocument();
  });
});
