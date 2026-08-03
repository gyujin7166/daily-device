import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';

import { cartItemFixture } from '../../../../test/mocks/handlers';

import CartContent from './CartContent';

const mocks = vi.hoisted(() => ({
  handleUpsertCartItem: vi.fn(),
  handleDeleteCartItem: vi.fn(),
  useCartActions: vi.fn(),
  pendingAddingItemKeys: {} as Record<string, true>,
  quantities: {} as Record<string, number>,
}));

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

vi.mock('next-intl', () => ({
  useFormatter: () => ({
    number: (value: number) => value.toLocaleString('ko-KR'),
  }),
  useTranslations: () => (key: string) =>
    ({
      color: '색상',
      currency: '{amount}원',
      decreaseQuantity: '수량 감소',
      deleteItem: '상품 삭제',
      increaseQuantity: '수량 증가',
      quantity: '수량',
    })[key] ?? key,
}));

vi.mock('@entities/cart/model/store/cartPendingStore', () => ({
  useCartPendingStore: (
    selector: (state: {
      pendingAddingItemKeys: Record<string, true>;
    }) => unknown,
  ) => selector({ pendingAddingItemKeys: mocks.pendingAddingItemKeys }),
}));

vi.mock('@entities/cart/model/store/cartQuantityStore', () => ({
  useCartQuantityStore: (
    selector: (state: { quantities: Record<string, number> }) => unknown,
  ) => selector({ quantities: mocks.quantities }),
}));

vi.mock('@entities/cart/model/hooks/useCartActions', () => ({
  default: () => {
    mocks.useCartActions();

    return {
      handleUpsertCartItem: mocks.handleUpsertCartItem,
      handleDeleteCartItem: mocks.handleDeleteCartItem,
    };
  },
}));

const variantKey = getCartVariantKey(cartItemFixture);

describe('CartContent', () => {
  beforeEach(() => {
    mocks.useCartActions.mockClear();
    mocks.quantities = {};
    mocks.pendingAddingItemKeys = {};
  });

  it('동일한 상품 props로 부모가 다시 렌더되어도 상품 행 렌더를 생략한다', () => {
    const { rerender } = render(<CartContent item={cartItemFixture} />);

    expect(mocks.useCartActions).toHaveBeenCalledTimes(1);

    rerender(<CartContent item={cartItemFixture} />);

    expect(mocks.useCartActions).toHaveBeenCalledTimes(1);
  });

  it('수량을 증가시키고 상품을 삭제한다', async () => {
    const user = userEvent.setup();
    render(<CartContent item={cartItemFixture} />);

    await user.click(screen.getByRole('button', { name: '수량 증가' }));
    await user.click(screen.getByRole('button', { name: '상품 삭제' }));

    expect(mocks.handleUpsertCartItem).toHaveBeenCalledWith({
      cartItemId: cartItemFixture.id,
      productId: cartItemFixture.productId,
      quantity: 1,
      productColorId: cartItemFixture.productColorId,
      colorName: cartItemFixture.colorName,
    });
    expect(mocks.handleDeleteCartItem).toHaveBeenCalledWith({
      cartItemId: cartItemFixture.id,
      productId: cartItemFixture.productId,
      productColorId: cartItemFixture.productColorId,
      colorName: cartItemFixture.colorName,
    });
  });

  it('최소 수량에서는 감소 버튼을 비활성화한다', () => {
    mocks.quantities = { [variantKey]: 1 };

    render(<CartContent item={cartItemFixture} />);

    expect(screen.getByRole('button', { name: '수량 감소' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '수량 증가' })).toBeEnabled();
  });

  it('최대 수량에서는 증가 버튼을 비활성화한다', () => {
    mocks.quantities = { [variantKey]: 10 };

    render(<CartContent item={cartItemFixture} />);

    expect(screen.getByRole('button', { name: '수량 증가' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '수량 감소' })).toBeEnabled();
  });

  it('상품 추가 처리 중에는 삭제 버튼을 비활성화한다', () => {
    mocks.pendingAddingItemKeys = { [variantKey]: true };

    render(<CartContent item={cartItemFixture} />);

    expect(screen.getByRole('button', { name: '상품 삭제' })).toBeDisabled();
  });
});
