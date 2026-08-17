import { useLayoutEffect } from 'react';

import { delay, HttpResponse, http } from 'msw';
import { SessionProvider } from 'next-auth/react';

import type { UserAddress } from '@entities/address/model/types';
import type { CartResponse, UserCartItem } from '@entities/cart/model/types';

import {
  BUY_NOW_CHECKOUT_STORAGE_KEY,
  CHECKOUT_ENTRY_STORAGE_KEY,
} from '@shared/constants/checkout';

import CheckoutPageContent from './CheckoutPageContent';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { Session } from 'next-auth';

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
  updatedAt: '2026-08-13T00:00:00.000Z',
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

const createCartHandler = (items: UserCartItem[]) =>
  http.get('*/api/cart', () => {
    const cart: CartResponse = {
      id: 301,
      items,
      totalPrice: items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      ),
    };

    return HttpResponse.json({ items: cart, message: 'Success' });
  });

const loadingCartHandler = http.get('*/api/cart', async () => {
  await delay('infinite');

  return HttpResponse.json({ items: null, message: 'Success' });
});

const addressesHandler = http.get('*/api/addresses', () =>
  HttpResponse.json({ items: [savedAddress], message: 'Success' }),
);

function CheckoutPagePreview({ entry }: { entry: 'cart' | 'direct' }) {
  useLayoutEffect(() => {
    window.sessionStorage.removeItem(CHECKOUT_ENTRY_STORAGE_KEY);
    window.sessionStorage.removeItem(BUY_NOW_CHECKOUT_STORAGE_KEY);

    if (entry === 'cart') {
      window.sessionStorage.setItem(CHECKOUT_ENTRY_STORAGE_KEY, 'cart');
    }
  }, [entry]);

  return (
    <SessionProvider
      session={session}
      refetchInterval={0}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <CheckoutPageContent />
    </SessionProvider>
  );
}

const meta = {
  title: 'Features/Checkout/CheckoutPageContent',
  component: CheckoutPageContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/checkout',
      },
    },
  },
} satisfies Meta<typeof CheckoutPageContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <CheckoutPagePreview entry="cart" />,
  parameters: {
    msw: {
      handlers: [createCartHandler(checkoutItems), addressesHandler],
    },
  },
};

export const Loading: Story = {
  render: () => <CheckoutPagePreview entry="cart" />,
  parameters: {
    msw: {
      handlers: [loadingCartHandler],
    },
  },
};

export const Empty: Story = {
  render: () => <CheckoutPagePreview entry="direct" />,
  parameters: {
    msw: {
      handlers: [createCartHandler([])],
    },
  },
};
