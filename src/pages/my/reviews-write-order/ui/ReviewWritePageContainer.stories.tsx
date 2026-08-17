import { delay, HttpResponse, http } from 'msw';
import { SessionProvider } from 'next-auth/react';

import type { OrderResponse } from '@entities/order/model/types';
import type { ProductReviewEditItem } from '@entities/review/model/types';

import ReviewWritePageContainer from './ReviewWritePageContainer';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { Session } from 'next-auth';

const orderNumber = 'DD-26070000001';
const productId = 101;
const productColorId = 201;
const orderItemId = 401;

const session: Session = {
  user: {
    id: 'storybook-user',
    name: '김데일리',
    email: 'yun@daily-device.dev',
  },
  expires: '2099-12-31T23:59:59.999Z',
};

const order: OrderResponse = {
  id: 301,
  orderNumber,
  createdAt: '2026-07-03T00:00:00.000Z',
  deliveryDate: '2026-07-08T00:00:00.000Z',
  status: 'DELIVERED',
  orderShipping: {
    recipientName: '김데일리',
    recipientPhone: '010-1234-5678',
    address1: '서울시 중구 세종대로 1',
    address2: '101호',
  },
  orderItems: [
    {
      id: orderItemId,
      productId,
      productColorId,
      productName: 'Daily Device Wireless Mouse',
      colorName: 'Graphite',
      quantity: 2,
      reviewStatus: 'PENDING',
      price: 59000,
      product: {
        slug: 'daily-device-wireless-mouse',
        category: { slug: 'mice' },
        ProductImage: [
          {
            image_url: '/images/storybook/featured-nook-keys-core.webp',
            isMain: true,
            productColorId,
            order: 0,
          },
        ],
      },
      colorHex: '#343a40',
      colorId: 1,
      reviewWritten: false,
      reviewAdminHiddenAt: null,
    },
  ],
};

const existingReview: ProductReviewEditItem = {
  id: 501,
  productId,
  rating: 4,
  title: '매일 사용하기 좋은 마우스',
  content: '그립감이 편안하고 무선 연결도 안정적이라 만족스럽습니다.',
  adminHiddenAt: null,
  ProductReviewImage: [
    {
      image_url: '/images/storybook/featured-nook-keys-core.webp',
      blur_data_url: null,
      order: 0,
    },
  ],
};

const createOrdersHandler = (orders: OrderResponse[]) =>
  http.get('*/api/orders', () =>
    HttpResponse.json({ items: orders, message: 'Success' }),
  );

const loadingOrdersHandler = http.get('*/api/orders', async () => {
  await delay('infinite');

  return HttpResponse.json({ items: [], message: 'Success' });
});

const saveReviewHandler = http.post('*/api/product-reviews', () =>
  HttpResponse.json({
    items: {
      id: existingReview.id,
      userId: session.user?.id,
      productId,
      orderItemId,
      rating: existingReview.rating,
      title: existingReview.title,
      content: existingReview.content,
      createdAt: '2026-07-09T00:00:00.000Z',
      updatedAt: '2026-07-09T00:00:00.000Z',
    },
    message: 'Success',
  }),
);

const meta = {
  title: 'Pages/My/ReviewsWrite/ReviewWritePageContainer',
  component: ReviewWritePageContainer,
  tags: ['autodocs'],
  args: {
    orderNumber,
    productId,
    colorId: productColorId,
    orderItemId,
    productReview: null,
    reviewAdminHiddenAt: null,
  },
  decorators: [
    (Story) => (
      <SessionProvider
        session={session}
        refetchInterval={0}
        refetchOnWindowFocus={false}
        refetchWhenOffline={false}
      >
        <Story />
      </SessionProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: `/my/reviews/write/${orderNumber}`,
      },
    },
    msw: {
      handlers: [createOrdersHandler([order]), saveReviewHandler],
    },
  },
} satisfies Meta<typeof ReviewWritePageContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Editing: Story = {
  args: {
    productReview: existingReview,
  },
};

export const AdminHidden: Story = {
  name: 'Admin Hidden',
  args: {
    productReview: existingReview,
    reviewAdminHiddenAt: '2026-07-10T00:00:00.000Z',
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [loadingOrdersHandler],
    },
  },
};

export const OrderNotFound: Story = {
  name: 'Order Not Found',
  parameters: {
    msw: {
      handlers: [createOrdersHandler([])],
    },
  },
};

export const ItemNotFound: Story = {
  name: 'Item Not Found',
  args: {
    productId: 999,
    colorId: null,
    orderItemId: 999,
  },
};
