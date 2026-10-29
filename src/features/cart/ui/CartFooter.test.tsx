import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import { useCartLocalStore } from '@entities/cart/model/store/cartLocalStore';
import { useCartPendingStore } from '@entities/cart/model/store/cartPendingStore';
import { useCartQuantityStore } from '@entities/cart/model/store/cartQuantityStore';
import type { UserCartItem } from '@entities/cart/model/types';

import {
  BUY_NOW_CHECKOUT_STORAGE_KEY,
  CHECKOUT_ENTRY_STORAGE_KEY,
} from '@shared/constants/checkout';

import {
  cartItemFixture,
  localCartItemFixture,
} from '../../../../test/mocks/handlers';

import CartFooter from './CartFooter';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  mutationCount: 0,
  userItems: [] as UserCartItem[],
}));
vi.mock('@tanstack/react-query', () => ({
  useIsMutating: () => mocks.mutationCount,
}));
vi.mock('@entities/cart/queries/useCart', () => ({
  selectCartItems: vi.fn(),
  useCart: () => ({ data: mocks.userItems }),
}));
vi.mock('@shared/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock('next-intl', () => ({
  useFormatter: () => ({ number: (value: number) => String(value) }),
  useTranslations: () => (key: string, values?: { amount: string }) =>
    key === 'currency' ? values?.amount : key,
}));
const gtag = vi.fn();
const variantKey = getCartVariantKey(localCartItemFixture);

describe('CartFooter checkout analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('gtag', gtag);
    mocks.mutationCount = 0;
    mocks.userItems = [];
    useCartLocalStore.setState({ localCartItems: [localCartItemFixture] });
    useCartPendingStore.getState().actions.resetPendingState();
    useCartQuantityStore.getState().actions.resetQuantities();
    window.sessionStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('현재 표시 수량·subtotal을 전송하고 sessionStorage 저장 후 checkout으로 이동한다', async () => {
    const user = userEvent.setup();
    useCartQuantityStore.getState().actions.setQuantity(variantKey, 4);
    gtag.mockImplementationOnce(() => {
      expect(window.sessionStorage.getItem(CHECKOUT_ENTRY_STORAGE_KEY)).toBe(
        'cart',
      );
      expect(mocks.push).not.toHaveBeenCalled();
    });
    render(<CartFooter />);
    expect(gtag).not.toHaveBeenCalled();
    expect(screen.getAllByText('400000')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'checkout' }));
    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'begin_checkout', {
      currency: 'KRW',
      value: 400_000,
      items: [
        {
          item_id: '101',
          item_name: 'MX MASTER',
          item_variant: 'Graphite',
          price: 100_000,
          quantity: 4,
        },
      ],
    });
    expect(mocks.push).toHaveBeenCalledExactlyOnceWith('/checkout');
    expect(
      window.sessionStorage.getItem(BUY_NOW_CHECKOUT_STORAGE_KEY),
    ).toBeNull();
  });

  it('회원 장바구니에도 동일한 상품과 수량을 전송한다', async () => {
    const user = userEvent.setup();
    useCartLocalStore.setState({ localCartItems: [] });
    mocks.userItems = [cartItemFixture];
    render(<CartFooter />);
    await user.click(screen.getByRole('button', { name: 'checkout' }));
    expect(gtag).toHaveBeenCalledWith(
      'event',
      'begin_checkout',
      expect.objectContaining({
        value: 200_000,
        items: [expect.objectContaining({ quantity: 2 })],
      }),
    );
  });

  it.each(['empty', 'sync', 'adding', 'mutation', 'zero', 'over-limit', 'nan'])(
    '%s 상태에서는 진입과 이벤트가 없다',
    async (state) => {
      if (state === 'empty') useCartLocalStore.setState({ localCartItems: [] });
      if (state === 'sync')
        useCartPendingStore.getState().actions.startCartSync(variantKey);
      if (state === 'adding')
        useCartPendingStore.getState().actions.startAddingNewItem(variantKey);
      if (state === 'mutation') mocks.mutationCount = 1;
      if (state === 'zero')
        useCartQuantityStore.getState().actions.setQuantity(variantKey, 0);
      if (state === 'over-limit')
        useCartQuantityStore.getState().actions.setQuantity(variantKey, 11);
      if (state === 'nan')
        useCartQuantityStore
          .getState()
          .actions.setQuantity(variantKey, Number.NaN);
      render(<CartFooter />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      await userEvent.click(button);
      expect(gtag).not.toHaveBeenCalled();
      expect(mocks.push).not.toHaveBeenCalled();
    },
  );

  it('mount와 rerender만으로 begin_checkout을 전송하지 않는다', () => {
    const { rerender } = render(<CartFooter />);
    act(() =>
      useCartQuantityStore.getState().actions.setQuantity(variantKey, 3),
    );
    rerender(<CartFooter />);
    expect(gtag).not.toHaveBeenCalled();
  });
});
