import { Suspense } from 'react';

import { HttpResponse, http } from 'msw';

import MyPageOverviewSkeleton from '@features/my/ui/skeletons/MyPageOverviewSkeleton';

import type { UserAddress } from '@entities/address/model/types';
import type { OrderResponse } from '@entities/order/model/types';

import MyOverviewContent from './MyOverviewContent';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { Session } from 'next-auth';

const session: Session = {
  user: {
    id: 'storybook-user',
    name: '김데일리',
    email: 'yun@daily-device.dev',
    image: '/logo/daily-device-symbol-black-transparent.png',
    provider: 'credentials',
    lastLoginAt: '2026-08-12T01:30:00.000Z',
  },
  expires: '2099-12-31T23:59:59.999Z',
};

const emptySession: Session = {
  ...session,
  user: {
    ...session.user,
    image: null,
    lastLoginAt: null,
  },
};

const latestOrder: OrderResponse = {
  id: 301,
  orderNumber: 'DD-26080000001',
  createdAt: '2026-08-10T02:00:00.000Z',
  deliveryDate: null,
  status: 'SHIPPED',
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
      quantity: 2,
      reviewStatus: 'PENDING',
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
      reviewWritten: false,
      reviewAdminHiddenAt: null,
    },
  ],
};

const defaultAddress: UserAddress = {
  id: 501,
  recipientName: '김데일리',
  recipientPhone: '010-1234-5678',
  address1: '서울시 중구 세종대로 1',
  address2: '101호',
  isDefault: true,
  updatedAt: '2026-08-01T00:00:00.000Z',
};

const createOverviewHandlers = ({
  orders,
  addresses,
}: {
  orders: OrderResponse[];
  addresses: UserAddress[];
}) => [
  http.get('*/api/orders', ({ request }) => {
    const searchParams = new URL(request.url).searchParams;
    const page = Number(searchParams.get('page') ?? '1');
    const limit = Number(searchParams.get('limit') ?? '1');

    return HttpResponse.json({
      items: orders.slice(0, limit),
      total: orders.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(orders.length / limit)),
      message: 'Success',
    });
  }),
  http.get('*/api/addresses', () =>
    HttpResponse.json({ items: addresses, message: 'Success' }),
  ),
];

const meta = {
  title: 'Pages/My/Overview/MyOverviewContent',
  component: MyOverviewContent,
  tags: ['autodocs'],
  args: {
    session,
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-5xl">
        <Suspense fallback={<MyPageOverviewSkeleton />}>
          <Story />
        </Suspense>
      </div>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/my',
      },
    },
  },
} satisfies Meta<typeof MyOverviewContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: createOverviewHandlers({
        orders: [latestOrder],
        addresses: [defaultAddress],
      }),
    },
  },
};

export const Empty: Story = {
  args: {
    session: emptySession,
  },
  parameters: {
    msw: {
      handlers: createOverviewHandlers({ orders: [], addresses: [] }),
    },
  },
};
