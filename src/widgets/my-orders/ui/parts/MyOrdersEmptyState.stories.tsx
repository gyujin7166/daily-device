import { HttpResponse, http } from 'msw';

import MyOrdersEmptyState from './MyOrdersEmptyState';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const recommendedProducts = Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  slug: `daily-device-product-${index + 1}`,
  image_url: '/images/storybook/featured-breeze-mouse-desk.webp',
  alt: `Daily Device Product ${index + 1}`,
  productLine: index % 2 === 0 ? 'Daily Workspace' : 'Mobile Essentials',
  name: `Daily Device Product ${index + 1}`,
  description: 'A practical device selected for an everyday setup.',
  price: 89000 + index * 20000,
  priceLabel: `${(89000 + index * 20000).toLocaleString('ko-KR')}원`,
  href: `/products/devices/daily-device-product-${index + 1}`,
  productColor: [
    {
      id: index * 10 + 1,
      isDefault: true,
      color: { name: 'Graphite', hex: '#343a40' },
    },
    {
      id: index * 10 + 2,
      isDefault: false,
      color: { name: 'Cloud', hex: '#e9ecef' },
    },
  ],
  category: { name_en: 'Device', slug: 'devices' },
}));

const meta = {
  title: 'Widgets/MyOrders/MyOrdersEmptyState',
  component: MyOrdersEmptyState,
  tags: ['autodocs'],
  args: {
    isReviewWriteMode: false,
    isReviewWrittenMode: false,
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-5xl">
        <Story />
      </div>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/my/orders',
      },
    },
    msw: {
      handlers: [
        http.get('*/api/products/recommended', () =>
          HttpResponse.json({ items: recommendedProducts }),
        ),
      ],
    },
  },
} satisfies Meta<typeof MyOrdersEmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoReviewsToWrite: Story = {
  name: 'No Reviews To Write',
  args: {
    isReviewWriteMode: true,
  },
};

export const NoWrittenReviews: Story = {
  name: 'No Written Reviews',
  args: {
    isReviewWrittenMode: true,
  },
};
