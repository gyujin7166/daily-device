import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';

import { HttpResponse, http } from 'msw';
import { SessionProvider } from 'next-auth/react';
import { fn } from 'storybook/test';

import type { UserAddress } from '@entities/address/model/types';
import type { UserCartItem } from '@entities/cart/model/types';
import type { OrderResponse } from '@entities/order/model/types';

import { useCheckoutStore } from '../../model/store/checkoutStore';

import CheckoutFlowSection from './CheckoutFlowSection';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { Session } from 'next-auth';

type CheckoutFlowPreviewProps = ComponentProps<typeof CheckoutFlowSection>;

const session: Session = {
  user: {
    name: '김데일리',
    email: 'yun@daily-device.dev',
  },
  expires: '2099-12-31T23:59:59.999Z',
};

const savedAddress: UserAddress = {
  id: 1,
  recipientName: '김데일리',
  recipientPhone: '010-1234-5678',
  address1: '서울특별시 중구 세종대로 1',
  address2: '101호',
  isDefault: true,
  updatedAt: '2026-08-12T00:00:00.000Z',
};

const checkoutItems: UserCartItem[] = [
  {
    id: 401,
    productId: 101,
    productColorId: 201,
    colorName: 'Graphite',
    quantity: 1,
    product: {
      id: 101,
      name_en: 'Daily Device Wireless Mouse',
      slug: 'daily-device-wireless-mouse',
      price: 59000,
      priceLabel: '59,000원',
      image_url: '/images/storybook/featured-breeze-mouse-desk.webp',
      category: {
        name_en: 'Mice',
        slug: 'mice',
      },
    },
  },
  {
    id: 402,
    productId: 102,
    productColorId: 202,
    colorName: 'Cloud',
    quantity: 1,
    product: {
      id: 102,
      name_en: 'Arc One Mechanical Keyboard',
      slug: 'arc-one-mechanical-keyboard',
      price: 189000,
      priceLabel: '189,000원',
      image_url: '/images/storybook/featured-nook-keys-core.webp',
      category: {
        name_en: 'Keyboards',
        slug: 'keyboards',
      },
    },
  },
];

const completedOrder: OrderResponse = {
  id: 301,
  orderNumber: 'DD-26080000001',
  createdAt: '2026-08-12T00:00:00.000Z',
  deliveryDate: null,
  status: 'CONFIRMED',
  orderShipping: {
    recipientName: savedAddress.recipientName,
    recipientPhone: savedAddress.recipientPhone,
    address1: savedAddress.address1,
    address2: savedAddress.address2,
  },
  orderItems: [
    {
      id: 501,
      productId: 101,
      productColorId: 201,
      productName: 'Daily Device Wireless Mouse',
      colorName: 'Graphite',
      quantity: 1,
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

const addressesHandler = http.get('*/api/addresses', () =>
  HttpResponse.json({ items: [savedAddress], message: 'Success' }),
);

const completedOrderHandler = http.get('*/api/orders', () =>
  HttpResponse.json({ items: [completedOrder], message: 'Success' }),
);

function CheckoutFlowPreview({
  selectedMethod: initialSelectedMethod,
  onSelectMethod,
  ...props
}: CheckoutFlowPreviewProps) {
  const [selectedMethod, setSelectedMethod] = useState(initialSelectedMethod);

  useEffect(() => {
    setSelectedMethod(initialSelectedMethod);
  }, [initialSelectedMethod]);

  useEffect(() => {
    const { resetCheckoutState } = useCheckoutStore.getState().actions;

    resetCheckoutState();

    return resetCheckoutState;
  }, []);

  return (
    <CheckoutFlowSection
      {...props}
      selectedMethod={selectedMethod}
      onSelectMethod={(nextMethod) => {
        const resolvedMethod =
          typeof nextMethod === 'function'
            ? nextMethod(selectedMethod)
            : nextMethod;

        setSelectedMethod(resolvedMethod);
        onSelectMethod(resolvedMethod);
      }}
    />
  );
}

const meta = {
  title: 'Features/Checkout/CheckoutFlowSection',
  component: CheckoutFlowSection,
  tags: ['autodocs'],
  args: {
    orderNumber: null,
    hasCheckoutItems: true,
    totalQuantity: 2,
    checkoutItems,
    checkoutTotalPrice: 248000,
    isBuyNowRequested: false,
    actionLabel: '테스트 결제',
    isActionDisabled: false,
    isBusy: false,
    isCartSyncPending: false,
    selectedMethod: 'test',
    onSelectMethod: fn(),
    onPay: fn(),
  },
  argTypes: {
    checkoutItems: { control: false },
    onSelectMethod: { control: false, table: { disable: true } },
    onPay: { control: false, table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <SessionProvider
        session={session}
        refetchInterval={0}
        refetchOnWindowFocus={false}
        refetchWhenOffline={false}
      >
        <div className="mx-auto w-full max-w-7xl">
          <Story />
        </div>
      </SessionProvider>
    ),
  ],
  render: (args) => <CheckoutFlowPreview {...args} />,
  parameters: {
    msw: {
      handlers: [addressesHandler],
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/checkout',
      },
    },
  },
} satisfies Meta<typeof CheckoutFlowSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BuyNow: Story = {
  name: 'Buy Now',
  args: {
    totalQuantity: 1,
    checkoutItems: checkoutItems.slice(0, 1),
    checkoutTotalPrice: 59000,
    isBuyNowRequested: true,
  },
};

export const Busy: Story = {
  args: {
    actionLabel: '결제 요청 중...',
    isActionDisabled: true,
    isBusy: true,
  },
};

export const OrderComplete: Story = {
  name: 'Order Complete',
  args: {
    orderNumber: completedOrder.orderNumber,
  },
  parameters: {
    msw: {
      handlers: [completedOrderHandler],
    },
  },
};
