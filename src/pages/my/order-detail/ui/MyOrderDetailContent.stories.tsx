import { fn } from 'storybook/test';

import type { OrderItem, OrderResponse } from '@entities/order/model/types';

import MyOrderDetailContent from './MyOrderDetailContent';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const mouseItem: OrderItem = {
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
};

const keyboardItem: OrderItem = {
  id: 402,
  productId: 102,
  productColorId: 202,
  productName: 'Arc One Mechanical Keyboard',
  colorName: 'Cloud',
  quantity: 1,
  reviewStatus: 'COMPLETED',
  price: 189000,
  product: {
    slug: 'arc-one-mechanical-keyboard',
    category: { slug: 'keyboards' },
    ProductImage: [
      {
        image_url: '/images/storybook/featured-nook-keys-core.webp',
        isMain: true,
        productColorId: 202,
        order: 0,
      },
    ],
  },
  colorHex: '#e9ecef',
  colorId: 2,
  reviewWritten: true,
  reviewAdminHiddenAt: null,
};

const confirmedOrder: OrderResponse = {
  id: 301,
  orderNumber: 'DD-26070000001',
  createdAt: '2026-07-03T00:00:00.000Z',
  deliveryDate: null,
  status: 'CONFIRMED',
  orderShipping: {
    recipientName: '김데일리',
    recipientPhone: '010-1234-5678',
    address1: '서울시 중구 세종대로 1',
    address2: '101호',
  },
  orderItems: [mouseItem, keyboardItem],
};

const totalPrice = confirmedOrder.orderItems.reduce(
  (total, item) => total + item.price * item.quantity,
  0,
);

const createOrderForStatus = (
  status: OrderResponse['status'],
  orderNumber: string,
): OrderResponse => ({
  ...confirmedOrder,
  orderNumber,
  status,
  deliveryDate: status === 'DELIVERED' ? '2026-07-08T00:00:00.000Z' : null,
});

const meta = {
  title: 'Pages/My/OrderDetail/MyOrderDetailContent',
  component: MyOrderDetailContent,
  tags: ['autodocs'],
  args: {
    order: confirmedOrder,
    totalPrice,
    canDeleteOrder: false,
    canCancelOrder: true,
    isDeletePending: false,
    isCancelPending: false,
    onDeleteOrder: fn(),
    onCancelOrder: fn(),
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
        pathname: `/my/orders/${confirmedOrder.orderNumber}`,
      },
    },
  },
} satisfies Meta<typeof MyOrderDetailContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pending: Story = {
  args: {
    order: createOrderForStatus('PENDING', 'DD-26070000002'),
    canCancelOrder: false,
  },
};

export const Expired: Story = {
  args: {
    order: createOrderForStatus('EXPIRED', 'DD-26070000003'),
    canCancelOrder: false,
  },
};

export const Shipped: Story = {
  args: {
    order: createOrderForStatus('SHIPPED', 'DD-26070000004'),
    canCancelOrder: false,
  },
};

export const Delivered: Story = {
  args: {
    order: createOrderForStatus('DELIVERED', 'DD-26070000005'),
    canDeleteOrder: true,
    canCancelOrder: false,
  },
};

export const Cancelled: Story = {
  args: {
    order: createOrderForStatus('CANCELLED', 'DD-26070000006'),
    canCancelOrder: false,
  },
};
