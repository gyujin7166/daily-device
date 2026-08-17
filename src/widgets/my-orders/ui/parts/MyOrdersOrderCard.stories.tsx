import type { ComponentProps } from 'react';

import { useFormatter, useTranslations } from 'next-intl';
import { fn } from 'storybook/test';

import {
  getMyOrdersStatusBadgeClass,
  getOrderRecipientName,
  getOrderTotal,
  myOrdersActionButtonClassName,
} from '@features/my/model/orderDisplay';

import type { OrderItem, OrderResponse } from '@entities/order/model/types';

import MyOrdersItemAction from './MyOrdersItemAction';
import MyOrdersOrderCard from './MyOrdersOrderCard';

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
  orderItems: [mouseItem],
};

const multipleItemsOrder: OrderResponse = {
  ...confirmedOrder,
  id: 302,
  orderNumber: 'DD-26070000002',
  orderItems: [mouseItem, keyboardItem],
};

const shippedOrder: OrderResponse = {
  ...confirmedOrder,
  id: 303,
  orderNumber: 'DD-26070000003',
  status: 'SHIPPED',
};

const deliveredOrder: OrderResponse = {
  ...multipleItemsOrder,
  id: 304,
  orderNumber: 'DD-26070000004',
  deliveryDate: '2026-07-08T00:00:00.000Z',
  status: 'DELIVERED',
};

const hiddenReviewOrder: OrderResponse = {
  ...deliveredOrder,
  id: 305,
  orderNumber: 'DD-26070000005',
  orderItems: [
    {
      ...keyboardItem,
      reviewAdminHiddenAt: '2026-07-10T00:00:00.000Z',
    },
  ],
};

const cancelledOrder: OrderResponse = {
  ...confirmedOrder,
  id: 306,
  orderNumber: 'DD-26070000006',
  status: 'CANCELLED',
};

type MyOrdersOrderCardStoryProps = ComponentProps<typeof MyOrdersOrderCard>;

function MyOrdersOrderCardStory(args: MyOrdersOrderCardStoryProps) {
  const t = useTranslations('MyOrders');
  const format = useFormatter();
  const orderDetailHref = `/my/orders/${args.order.orderNumber}`;
  const createdAt = new Date(args.order.createdAt);
  const orderPlacedDateText = Number.isNaN(createdAt.getTime())
    ? '-'
    : format.dateTime(createdAt, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: 'UTC',
      });

  return (
    <MyOrdersOrderCard
      {...args}
      orderDetailHref={orderDetailHref}
      statusBadgeClassName={getMyOrdersStatusBadgeClass(args.order.status)}
      statusText={t(`status.${args.order.status}`)}
      orderPlacedDateText={orderPlacedDateText}
      orderTotal={getOrderTotal(args.order)}
      recipientName={getOrderRecipientName(args.order)}
      isConfirmableOrder={args.order.status === 'CONFIRMED'}
      actionButtonClassName={myOrdersActionButtonClassName}
      getOrderItemAction={(item) => (
        <MyOrdersItemAction
          mode="all"
          order={args.order}
          item={item}
          orderDetailHref={orderDetailHref}
        />
      )}
    />
  );
}

const meta = {
  title: 'Widgets/MyOrders/MyOrdersOrderCard',
  component: MyOrdersOrderCard,
  tags: ['autodocs'],
  render: (args) => <MyOrdersOrderCardStory {...args} />,
  args: {
    order: confirmedOrder,
    orderDetailHref: `/my/orders/${confirmedOrder.orderNumber}`,
    statusBadgeClassName: getMyOrdersStatusBadgeClass(confirmedOrder.status),
    statusText: '결제완료',
    orderPlacedDateText: '2026. 7. 3.',
    orderTotal: getOrderTotal(confirmedOrder),
    recipientName: getOrderRecipientName(confirmedOrder),
    isConfirmableOrder: true,
    isConfirmDeliveryDisabled: false,
    actionButtonClassName: myOrdersActionButtonClassName,
    onConfirmDelivery: fn(),
    getOrderItemAction: () => null,
  },
  argTypes: {
    orderDetailHref: { control: false, table: { disable: true } },
    statusBadgeClassName: { control: false, table: { disable: true } },
    statusText: { control: false, table: { disable: true } },
    orderPlacedDateText: { control: false, table: { disable: true } },
    orderTotal: { control: false, table: { disable: true } },
    recipientName: { control: false, table: { disable: true } },
    isConfirmableOrder: { control: false, table: { disable: true } },
    actionButtonClassName: { control: false, table: { disable: true } },
    onConfirmDelivery: { control: false, table: { disable: true } },
    getOrderItemAction: { control: false, table: { disable: true } },
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
} satisfies Meta<typeof MyOrdersOrderCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultipleItems: Story = {
  name: 'Multiple Items',
  args: {
    order: multipleItemsOrder,
  },
};

export const Shipped: Story = {
  args: {
    order: shippedOrder,
  },
};

export const Delivered: Story = {
  args: {
    order: deliveredOrder,
  },
};

export const HiddenReview: Story = {
  name: 'Hidden Review',
  args: {
    order: hiddenReviewOrder,
  },
};

export const Cancelled: Story = {
  args: {
    order: cancelledOrder,
  },
};
