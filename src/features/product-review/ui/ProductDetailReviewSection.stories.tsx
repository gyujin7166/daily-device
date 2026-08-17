import { useEffect, useRef, useState } from 'react';
import type { ComponentProps } from 'react';

import { HttpResponse, delay, http } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import type { ProductReviewFilter } from '@entities/review/model/filter';
import type { ProductReviewSortOption } from '@entities/review/model/sort';
import type {
  ProductReviewGalleryImage,
  ProductReviewGalleryPageResponse,
  ProductReviewListItem,
  ProductReviewsPayload,
} from '@entities/review/model/types';

import ProductDetailReviewSection from './ProductDetailReviewSection';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const reviews: ProductReviewListItem[] = [
  {
    id: 301,
    productId: 101,
    rating: 5,
    title: 'Photo-ready setup',
    content:
      'The compact layout fits my desk well, and the graphite color looks even better in person.',
    createdAt: '2026-07-18T09:30:00.000Z',
    user: { maskedUser: 'yun***' },
    orderItem: { colorName: 'Graphite', colorHex: '#343a40' },
    helpfulCount: 12,
    currentUserVote: false,
    ProductReviewImage: [
      {
        id: 401,
        image_url: '/images/storybook/featured-nook-keys-core.webp',
        blur_data_url: null,
        order: 0,
      },
    ],
  },
  {
    id: 302,
    productId: 101,
    rating: 4,
    title: 'Quiet switches for daily work',
    content:
      'Pairing was quick on both my laptop and tablet. The switches are comfortable for long sessions.',
    createdAt: '2026-07-12T14:20:00.000Z',
    user: { maskedUser: 'dev***' },
    orderItem: { colorName: 'Cloud', colorHex: '#e9ecef' },
    helpfulCount: 7,
    currentUserVote: null,
    ProductReviewImage: [],
  },
  {
    id: 303,
    productId: 101,
    rating: 5,
    title: 'A balanced compact keyboard',
    content:
      'It keeps the navigation keys I use while leaving enough room for a mouse.',
    createdAt: '2026-07-05T11:10:00.000Z',
    user: { maskedUser: 'key***' },
    orderItem: { colorName: 'Mint', colorHex: '#63e6be' },
    helpfulCount: 4,
    currentUserVote: false,
    ProductReviewImage: [],
  },
];

const createReviewPayload = (
  items: ProductReviewListItem[],
): ProductReviewsPayload => ({
  items,
  totalItems: items.length,
  summaryTotalItems: reviews.length,
  totalReviewImageCount: 1,
  averageRating: 4.7,
  ratingCounts: [2, 1, 0, 0, 0],
  totalPages: 1,
  currentPage: 1,
  perPage: 6,
});

const defaultReviewPayload = createReviewPayload(reviews);
const imageReviewPayload = createReviewPayload([reviews[0]!]);
const emptyReviewPayload: ProductReviewsPayload = {
  items: [],
  totalItems: 0,
  summaryTotalItems: 0,
  totalReviewImageCount: 0,
  averageRating: 0,
  ratingCounts: [0, 0, 0, 0, 0],
  totalPages: 0,
  currentPage: 1,
  perPage: 6,
};

const galleryImage: ProductReviewGalleryImage = {
  id: 401,
  productReviewId: reviews[0]!.id,
  image_url: '/images/storybook/featured-nook-keys-core.webp',
  blur_data_url: null,
  order: 0,
  productReview: {
    id: reviews[0]!.id,
    rating: reviews[0]!.rating,
    title: reviews[0]!.title,
    content: reviews[0]!.content,
    createdAt: reviews[0]!.createdAt,
    helpfulCount: reviews[0]!.helpfulCount,
    currentUserVote: reviews[0]!.currentUserVote,
    reviewImages: reviews[0]!.ProductReviewImage,
    orderItem: reviews[0]!.orderItem,
    user: reviews[0]!.user,
  },
};

const galleryPayload: ProductReviewGalleryPageResponse = {
  items: [galleryImage],
  total: 1,
  page: 1,
  limit: 20,
  hasMore: false,
};

const emptyGalleryPayload: ProductReviewGalleryPageResponse = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  hasMore: false,
};

const galleryHandler = http.get('*/api/product-reviews/gallery', () =>
  HttpResponse.json(galleryPayload),
);

const emptyGalleryHandler = http.get('*/api/product-reviews/gallery', () =>
  HttpResponse.json(emptyGalleryPayload),
);

const reviewHandler = http.get('*/api/product-reviews', ({ request }) => {
  const filter = new URL(request.url).searchParams.get('filter');
  const payload =
    filter === 'with_images' ? imageReviewPayload : defaultReviewPayload;

  return HttpResponse.json({ items: payload });
});

type ReviewSectionProps = ComponentProps<typeof ProductDetailReviewSection>;

function ReviewSectionStory(args: ReviewSectionProps) {
  const reviewContentTopRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(args.currentPage);
  const [reviewSortOption, setReviewSortOption] = useState(
    args.reviewSortOption,
  );
  const [reviewFilter, setReviewFilter] = useState(args.reviewFilter);

  useEffect(() => {
    setCurrentPage(args.currentPage);
  }, [args.currentPage]);

  useEffect(() => {
    setReviewSortOption(args.reviewSortOption);
  }, [args.reviewSortOption]);

  useEffect(() => {
    setReviewFilter(args.reviewFilter);
  }, [args.reviewFilter]);

  const handlePageChange: typeof setCurrentPage = (nextPage) => {
    setCurrentPage(nextPage);
    args.setCurrentPage(nextPage);
  };

  const handleSortChange = (nextSort: ProductReviewSortOption) => {
    setCurrentPage(1);
    setReviewSortOption(nextSort);
    args.onReviewSortChange(nextSort);
  };

  const handleFilterChange = (nextFilter: ProductReviewFilter) => {
    setCurrentPage(1);
    setReviewFilter(nextFilter);
    args.onReviewFilterChange(nextFilter);
  };

  return (
    <ProductDetailReviewSection
      {...args}
      reviewContentTopRef={reviewContentTopRef}
      currentPage={currentPage}
      setCurrentPage={handlePageChange}
      reviewSortOption={reviewSortOption}
      reviewFilter={reviewFilter}
      onReviewSortChange={handleSortChange}
      onReviewFilterChange={handleFilterChange}
    />
  );
}

const meta = {
  title: 'Features/ProductReview/ProductDetailReviewSection',
  component: ProductDetailReviewSection,
  tags: ['autodocs'],
  render: (args) => <ReviewSectionStory {...args} />,
  args: {
    detail: 'arc-one-mechanical-keyboard',
    currentPath: '/products/keyboard/arc-one-mechanical-keyboard',
    reviewContentTopRef: { current: null },
    currentPage: 1,
    setCurrentPage: fn(),
    reviewSortOption: 'latest',
    reviewFilter: 'all',
    onReviewSortChange: fn(),
    onReviewFilterChange: fn(),
  },
  argTypes: {
    reviewContentTopRef: { control: false, table: { disable: true } },
    setCurrentPage: { control: false, table: { disable: true } },
    onReviewSortChange: { control: false, table: { disable: true } },
    onReviewFilterChange: { control: false, table: { disable: true } },
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/products/keyboard/arc-one-mechanical-keyboard',
      },
    },
    msw: {
      handlers: [galleryHandler, reviewHandler],
    },
  },
} satisfies Meta<typeof ProductDetailReviewSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoReviews: Story = {
  name: 'No Reviews',
  parameters: {
    msw: {
      handlers: [
        emptyGalleryHandler,
        http.get('*/api/product-reviews', () =>
          HttpResponse.json({ items: emptyReviewPayload }),
        ),
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        emptyGalleryHandler,
        http.get('*/api/product-reviews', async () => {
          await delay('infinite');

          return HttpResponse.json({ items: defaultReviewPayload });
        }),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        emptyGalleryHandler,
        http.get('*/api/product-reviews', () =>
          HttpResponse.json(
            { message: 'Failed to load product reviews.' },
            { status: 503 },
          ),
        ),
      ],
    },
  },
};

export const FilterReviews: Story = {
  name: 'Filter Reviews',
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText('Quiet switches for daily work'),
    ).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', {
        name: /이미지 포함|With images/,
      }),
    );

    await waitFor(async () => {
      await expect(canvas.getByText('Photo-ready setup')).toBeVisible();
      await expect(
        canvas.queryByText('Quiet switches for daily work'),
      ).not.toBeInTheDocument();
    });
  },
};

export const OpenGallery: Story = {
  name: 'Open Gallery',
  play: async ({ canvas }) => {
    const galleryPreviewButton = await waitFor(
      () =>
        within(
          canvas.getByRole('region', {
            name: /사진 후기|Photo reviews/,
          }),
        ).getByRole('button', {
          name: /1번째 사진 후기 자세히 보기|View photo review 1/,
        }),
      { timeout: 5000 },
    );

    await userEvent.click(galleryPreviewButton);

    const galleryDialog = await canvas.findByRole('dialog', {
      name: /사진 후기 갤러리|Photo review gallery/,
    });
    const galleryCanvas = within(galleryDialog);

    await expect(galleryDialog).toBeVisible();
    await expect(
      galleryCanvas.getByRole('heading', {
        name: /^사진 후기$|^Photo reviews$/,
      }),
    ).toBeVisible();

    await userEvent.click(
      await galleryCanvas.findByRole('button', {
        name: /1번째 사진 후기 자세히 보기|View photo review 1/,
      }),
    );

    await waitFor(async () => {
      await expect(galleryCanvas.getByText('Photo-ready setup')).toBeVisible();
    });
  },
};
