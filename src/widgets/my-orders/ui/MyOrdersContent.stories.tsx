import { HttpResponse, http } from 'msw';

import type { OrderItem, OrderResponse } from '@entities/order/model/types';

import MyOrdersContent from './MyOrdersContent';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const createOrderItem = ({
  id,
  reviewWritten = false,
}: {
  id: number;
  reviewWritten?: boolean;
}): OrderItem => ({
  id,
  productId: 100 + id,
  productColorId: 200 + id,
  productName: `Daily Device Product ${id}`,
  colorName: id % 2 === 0 ? 'Cloud' : 'Graphite',
  quantity: id % 2 === 0 ? 1 : 2,
  reviewStatus: reviewWritten ? 'COMPLETED' : 'PENDING',
  price: 59000 + id * 10000,
  product: {
    slug: `daily-device-product-${id}`,
    category: { slug: 'devices' },
    ProductImage: [
      {
        image_url: '/images/storybook/featured-breeze-mouse-desk.webp',
        isMain: true,
        productColorId: 200 + id,
        order: 0,
      },
    ],
  },
  colorHex: id % 2 === 0 ? '#e9ecef' : '#343a40',
  colorId: id,
  reviewWritten,
  reviewAdminHiddenAt: null,
});

const createOrder = ({
  id,
  status = 'DELIVERED',
  reviewWritten = false,
}: {
  id: number;
  status?: OrderResponse['status'];
  reviewWritten?: boolean;
}): OrderResponse => ({
  id,
  orderNumber: `DD-2607000000${id}`,
  createdAt: `2026-07-${String(id + 1).padStart(2, '0')}T00:00:00.000Z`,
  deliveryDate:
    status === 'DELIVERED'
      ? `2026-07-${String(id + 4).padStart(2, '0')}T00:00:00.000Z`
      : null,
  status,
  orderShipping: {
    recipientName: '김데일리',
    recipientPhone: '010-1234-5678',
    address1: '서울시 중구 세종대로 1',
    address2: '101호',
  },
  orderItems: [createOrderItem({ id, reviewWritten })],
});

const defaultOrders = [
  createOrder({ id: 1, status: 'CONFIRMED' }),
  createOrder({ id: 2, status: 'SHIPPED' }),
];
const reviewWriteOrders = [createOrder({ id: 3 })];
const reviewWrittenOrders = [createOrder({ id: 4, reviewWritten: true })];
const paginatedOrders = Array.from({ length: 6 }, (_, index) =>
  createOrder({
    id: index + 1,
    status: index % 2 === 0 ? 'SHIPPED' : 'DELIVERED',
    reviewWritten: index % 2 === 1,
  }),
);

const createOrdersHandler = (orders: OrderResponse[]) =>
  http.get('*/api/orders', ({ request }) => {
    const searchParams = new URL(request.url).searchParams;
    const page = Number(searchParams.get('page') ?? '1');
    const limit = Number(searchParams.get('limit') ?? '5');
    const startIndex = (page - 1) * limit;

    return HttpResponse.json({
      items: orders.slice(startIndex, startIndex + limit),
      total: orders.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(orders.length / limit)),
      message: 'Success',
    });
  });

const confirmDeliveryHandler = http.post(
  '*/api/orders/:orderNumber/confirm-delivery',
  () => HttpResponse.json({ message: 'Success' }),
);

const meta = {
  title: 'Widgets/MyOrders/MyOrdersContent',
  component: MyOrdersContent,
  tags: ['autodocs'],
  args: {
    mode: 'all',
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-6xl">
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
  },
} satisfies Meta<typeof MyOrdersContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [createOrdersHandler(defaultOrders), confirmDeliveryHandler],
    },
  },
};

export const ReviewWrite: Story = {
  name: 'Review Write',
  args: {
    mode: 'review',
  },
  parameters: {
    msw: {
      handlers: [createOrdersHandler(reviewWriteOrders)],
    },
    nextjs: {
      navigation: {
        pathname: '/my/reviews/write',
      },
    },
  },
};

export const ReviewWritten: Story = {
  name: 'Review Written',
  args: {
    mode: 'review-written',
  },
  parameters: {
    msw: {
      handlers: [createOrdersHandler(reviewWrittenOrders)],
    },
    nextjs: {
      navigation: {
        pathname: '/my/reviews',
      },
    },
  },
};

export const Paginated: Story = {
  parameters: {
    msw: {
      handlers: [createOrdersHandler(paginatedOrders)],
    },
  },
};
