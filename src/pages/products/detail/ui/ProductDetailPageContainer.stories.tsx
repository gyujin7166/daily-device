import { HttpResponse, delay, http } from 'msw';

import type {
  ProductDetailResponse,
  ProductImageItem,
} from '@entities/product/model/types';
import type {
  ProductReviewGalleryPageResponse,
  ProductReviewListItem,
  ProductReviewsPayload,
} from '@entities/review/model/types';

import ProductDetailPageContainer from './ProductDetailPageContainer';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const productSlug = 'arc-one-mechanical-keyboard';
const categorySlug = 'keyboard';
const currentPath = `/products/${categorySlug}/${productSlug}`;

const productDetail: ProductDetailResponse = {
  product: {
    id: 101,
    productLine: 'EVERYDAY_LINE',
    name_en: 'Arc One Mechanical Keyboard',
    slug: productSlug,
    description:
      'A compact wireless keyboard designed for a clean everyday workspace.',
    detailed_description:
      'Reliable multi-device connectivity and a balanced typing feel make it suitable for work throughout the day.',
    price: 219000,
    originalPrice: 219000,
    discountedPrice: 189000,
    discountRate: 14,
    isDiscounted: true,
    priceLabel: '219,000원',
    originalPriceLabel: '219,000원',
    discountedPriceLabel: '189,000원',
    category: {
      name_en: 'Keyboard',
      name_ko: '키보드',
      slug: categorySlug,
    },
    productColor: [
      {
        id: 201,
        isDefault: true,
        color: { name: 'Graphite', hex: '#343a40' },
      },
      {
        id: 202,
        isDefault: false,
        color: { name: 'Cloud', hex: '#e9ecef' },
      },
    ],
  },
  productDetails: [
    {
      id: 1,
      titleId: 1,
      title_middle: 'KEYBOARD',
      title_sub: 'Core specifications',
      specification: JSON.stringify([
        'Layout: Compact 75%',
        'Connection: Bluetooth 5.1 / USB-C',
        'Battery: Up to 80 hours',
      ]),
      note: 'Compatible with Windows, macOS, and mobile devices.',
    },
    {
      id: 2,
      titleId: 2,
      title_middle: 'IN THE BOX',
      title_sub: 'Included items',
      specification: JSON.stringify([
        'Arc One Mechanical Keyboard',
        'USB-C charging cable',
        'Quick start guide',
      ]),
      note: null,
    },
  ],
};

const productImages: ProductImageItem[] = [
  {
    id: 1,
    image_url: '/images/storybook/featured-nook-keys-core.webp',
    order: 0,
    isMain: true,
    productColorId: 201,
  },
  {
    id: 2,
    image_url: '/images/storybook/category-tablet-keyboards.webp',
    order: 1,
    isMain: false,
    productColorId: 202,
  },
];

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
];

const reviewPayload: ProductReviewsPayload = {
  items: reviews,
  totalItems: reviews.length,
  summaryTotalItems: reviews.length,
  totalReviewImageCount: 1,
  averageRating: 4.5,
  ratingCounts: [1, 1, 0, 0, 0],
  totalPages: 1,
  currentPage: 1,
  perPage: 6,
};

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

const galleryPayload: ProductReviewGalleryPageResponse = {
  items: [
    {
      id: 401,
      productReviewId: reviews[0]!.id,
      image_url: '/images/storybook/featured-breeze-mouse-desk.webp',
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
    },
  ],
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

const recommendedProducts = Array.from({ length: 5 }, (_, index) => ({
  id: 201 + index,
  slug: `recommended-keyboard-${index + 1}`,
  image_url: '/images/storybook/featured-aster-webcam-mini.webp',
  alt: `Recommended keyboard ${index + 1}`,
  productLine: index % 2 === 0 ? 'EVERYDAY_LINE' : 'PRO_LINE',
  name: `Recommended Keyboard ${index + 1}`,
  description: 'A practical keyboard selected for an everyday workspace.',
  price: 129000 + index * 20000,
  priceLabel: `${(129000 + index * 20000).toLocaleString('ko-KR')}원`,
  href: `/products/${categorySlug}/recommended-keyboard-${index + 1}`,
  productColor: [
    {
      id: 501 + index,
      isDefault: true,
      color: { name: 'Graphite', hex: '#343a40' },
    },
  ],
  category: { name_en: 'Keyboard', slug: categorySlug },
}));

const productDetailHandler = http.get(`*/api/products/${productSlug}`, () =>
  HttpResponse.json({ items: productDetail }),
);

const productImagesHandler = http.get('*/api/products/:slug/images', () =>
  HttpResponse.json({ items: productImages }),
);

const reviewsHandler = http.get('*/api/product-reviews', ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const filter = searchParams.get('filter');
  const sort = searchParams.get('sort');
  const filteredItems = filter === 'with_images' ? [reviews[0]!] : reviews;
  const items =
    sort === 'oldest' ? [...filteredItems].reverse() : filteredItems;

  return HttpResponse.json({
    items: {
      ...reviewPayload,
      items,
      totalItems: items.length,
    },
  });
});

const galleryHandler = http.get('*/api/product-reviews/gallery', () =>
  HttpResponse.json(galleryPayload),
);

const recommendedProductsHandler = http.get('*/api/products/recommended', () =>
  HttpResponse.json({ items: recommendedProducts }),
);

const defaultHandlers = [
  productDetailHandler,
  productImagesHandler,
  reviewsHandler,
  galleryHandler,
  recommendedProductsHandler,
];

const meta = {
  title: 'Pages/Products/ProductDetailPageContainer',
  component: ProductDetailPageContainer,
  tags: ['autodocs'],
  args: {
    category: categorySlug,
    detail: productSlug,
    currentPath,
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: currentPath },
    },
    msw: {
      handlers: defaultHandlers,
    },
  },
} satisfies Meta<typeof ProductDetailPageContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LoadingDetail: Story = {
  name: 'Loading Detail',
  parameters: {
    msw: {
      handlers: [
        http.get(`*/api/products/${productSlug}`, async () => {
          await delay('infinite');

          return HttpResponse.json({ items: productDetail });
        }),
        productImagesHandler,
        reviewsHandler,
        galleryHandler,
        recommendedProductsHandler,
      ],
    },
  },
};

export const EmptyReviews: Story = {
  name: 'Empty Reviews',
  parameters: {
    msw: {
      handlers: [
        productDetailHandler,
        productImagesHandler,
        http.get('*/api/product-reviews', () =>
          HttpResponse.json({ items: emptyReviewPayload }),
        ),
        http.get('*/api/product-reviews/gallery', () =>
          HttpResponse.json(emptyGalleryPayload),
        ),
        recommendedProductsHandler,
      ],
    },
  },
};

export const RecommendedProductsError: Story = {
  name: 'Recommended Products Error',
  parameters: {
    msw: {
      handlers: [
        productDetailHandler,
        productImagesHandler,
        reviewsHandler,
        galleryHandler,
        http.get('*/api/products/recommended', () =>
          HttpResponse.json(
            { message: 'Failed to load recommended products.' },
            { status: 503 },
          ),
        ),
      ],
    },
  },
};
