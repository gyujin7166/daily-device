import { delay, HttpResponse, http } from 'msw';
import { SessionProvider } from 'next-auth/react';

import type { OrderResponse } from '@entities/order/model/types';

import MyOrderDetailContainer from './MyOrderDetailContainer';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { Session } from 'next-auth';

const requestedOrderNumber = 'DD-26070000999';

const session: Session = {
  user: {
    name: '김데일리',
    email: 'yun@daily-device.dev',
  },
  expires: '2099-12-31T23:59:59.999Z',
};

const existingOrder: OrderResponse = {
  id: 301,
  orderNumber: 'DD-26070000001',
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
      id: 401,
      productId: 101,
      productColorId: 201,
      productName: 'Daily Device Wireless Mouse',
      colorName: 'Graphite',
      quantity: 1,
      reviewStatus: 'COMPLETED',
      price: 59000,
      product: {
        slug: 'daily-device-wireless-mouse',
        category: { slug: 'mice' },
        ProductImage: [
          {
            image_url: '/images/storybook/featured-breeze-mouse-desk.webp',
            isMain: true,
            productColorId: 201,
            order: 0,
          },
        ],
      },
      colorHex: '#343a40',
      colorId: 1,
      reviewWritten: true,
      reviewAdminHiddenAt: null,
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

const meta = {
  title: 'Pages/My/OrderDetail/MyOrderDetailContainer',
  component: MyOrderDetailContainer,
  tags: ['autodocs'],
  args: {
    orderNumber: requestedOrderNumber,
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
        pathname: `/my/orders/${requestedOrderNumber}`,
      },
    },
  },
} satisfies Meta<typeof MyOrderDetailContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [loadingOrdersHandler],
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [createOrdersHandler([])],
    },
  },
};

export const NotFound: Story = {
  name: 'Not Found',
  parameters: {
    msw: {
      handlers: [createOrdersHandler([existingOrder])],
    },
  },
};
