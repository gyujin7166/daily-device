import { useEffect } from 'react';

import { expect, userEvent, waitFor } from 'storybook/test';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import { useCartDrawerStore } from '@entities/cart/model/store/cartDrawerStore';
import { useCartLocalStore } from '@entities/cart/model/store/cartLocalStore';
import { useCartPendingStore } from '@entities/cart/model/store/cartPendingStore';
import { useCartQuantityStore } from '@entities/cart/model/store/cartQuantityStore';
import type { LocalCartItem } from '@entities/cart/model/types';

import CartDrawer from './CartDrawer';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const localCartItems: LocalCartItem[] = [
  {
    productId: 101,
    productColorId: 201,
    colorName: 'Graphite',
    quantity: 2,
    product: {
      id: 101,
      name_en: 'Arc One Mechanical Keyboard',
      slug: 'arc-one-mechanical-keyboard',
      price: 189000,
      priceLabel: '189,000원',
      image_url: '/images/storybook/featured-breeze-mouse-desk.webp',
      category: {
        name_en: 'Keyboard',
        slug: 'keyboard',
      },
    },
  },
];

function CartDrawerPreview({ items }: { items: LocalCartItem[] }) {
  useEffect(() => {
    useCartLocalStore.setState({ localCartItems: items, hasHydrated: true });
    useCartPendingStore.getState().actions.resetPendingState();
    useCartQuantityStore
      .getState()
      .actions.replaceQuantities(
        Object.fromEntries(
          items.map((item) => [getCartVariantKey(item), item.quantity]),
        ),
      );
    useCartDrawerStore.getState().actions.openCart();

    return () => {
      useCartDrawerStore.getState().actions.closeCart();
      useCartLocalStore.setState({ localCartItems: [] });
      useCartPendingStore.getState().actions.resetPendingState();
      useCartQuantityStore.getState().actions.resetQuantities();
    };
  }, [items]);

  return <CartDrawer />;
}

const meta = {
  title: 'Features/Cart/CartDrawer',
  component: CartDrawer,
  tags: ['autodocs'],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/products' },
    },
  },
} satisfies Meta<typeof CartDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <CartDrawerPreview items={localCartItems} />,
};

export const Empty: Story = {
  render: () => <CartDrawerPreview items={[]} />,
};

export const IncreaseQuantity: Story = {
  name: 'Increase Quantity',
  render: () => <CartDrawerPreview items={localCartItems} />,
  play: async ({ canvas }) => {
    const quantityInput = await canvas.findByRole('textbox', {
      name: /수량|Quantity/,
    });
    const increaseButton = canvas.getByRole('button', {
      name: /수량 증가|Increase quantity/,
    });

    await expect(quantityInput).toHaveValue('2');
    await userEvent.click(increaseButton);
    await waitFor(async () => {
      await expect(quantityInput).toHaveValue('3');
    });
  },
};
