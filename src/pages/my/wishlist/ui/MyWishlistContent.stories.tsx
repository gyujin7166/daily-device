import { Suspense } from 'react';

import { HttpResponse, http } from 'msw';

import MyWishlistSkeleton from '@features/my/ui/skeletons/MyWishlistSkeleton';

import type { WishlistItem } from '@entities/wishlist/model/types';

import MyWishlistContent from './MyWishlistContent';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const wishlistItems: WishlistItem[] = Array.from({ length: 7 }, (_, index) => ({
  id: index + 1,
  image_url: '/images/storybook/featured-breeze-mouse-desk.webp',
  alt: `Daily Device Product ${index + 1}`,
  name: `Daily Device Product ${index + 1}`,
  description: '일상적인 작업 환경을 위한 실용적인 디바이스입니다.',
  productLine: index % 2 === 0 ? 'EVERYDAY_LINE' : 'PERFORMANCE_SERIES',
  price: 89000 + index * 20000,
  priceLabel: `${(89000 + index * 20000).toLocaleString('ko-KR')}원`,
  href: `/products/devices/daily-device-product-${index + 1}`,
  ProductImage: [
    {
      image_url: '/images/storybook/featured-breeze-mouse-desk.webp',
      isMain: true,
      productColorId: index * 10 + 1,
      order: 0,
    },
  ],
  productColor: [
    {
      id: index * 10 + 1,
      isDefault: true,
      color: { name: 'Graphite', hex: '#343a40' },
    },
    {
      id: index * 10 + 2,
      color: { name: 'Cloud', hex: '#e9ecef' },
    },
  ],
  category: { name_en: 'Device', slug: 'devices' },
}));

const recommendedProducts = wishlistItems.slice(0, 4).map((item) => ({
  ...item,
  slug: `daily-device-product-${item.id}`,
}));

const createWishlistHandlers = (fixture: WishlistItem[]) => {
  let currentItems = [...fixture];

  return [
    http.get('*/api/wishlist', () =>
      HttpResponse.json({ items: currentItems, message: 'Success' }),
    ),
    http.delete('*/api/wishlist', () => {
      currentItems = [];

      return HttpResponse.json({ message: 'Success' });
    }),
    http.get('*/api/products/recommended', () =>
      HttpResponse.json({ items: recommendedProducts, message: 'Success' }),
    ),
  ];
};

const meta = {
  title: 'Pages/My/Wishlist/MyWishlistContent',
  component: MyWishlistContent,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-6xl">
        <Suspense fallback={<MyWishlistSkeleton />}>
          <Story />
        </Suspense>
      </div>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/my/wishlist',
      },
    },
  },
} satisfies Meta<typeof MyWishlistContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: createWishlistHandlers(wishlistItems.slice(0, 3)),
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: createWishlistHandlers([]),
    },
  },
};

export const Paginated: Story = {
  parameters: {
    msw: {
      handlers: createWishlistHandlers(wishlistItems),
    },
  },
};
