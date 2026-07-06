import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';

import { cartItemFixture } from '../../../../test/mocks/handlers';

import CartContent from './CartContent';

const mocks = vi.hoisted(() => ({
  handleUpsertCartItem: vi.fn(),
  handleDeleteCartItem: vi.fn(),
  isCartVariantAdding: vi.fn(() => false),
  quantities: {} as Record<string, number>,
}));

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

vi.mock('@entities/cart/model/context/CartContext', () => ({
  useCartContext: () => ({
    quantities: mocks.quantities,
    isCartVariantAdding: mocks.isCartVariantAdding,
  }),
}));

vi.mock('@entities/cart/model/hooks/useCartActions', () => ({
  default: () => ({
    handleUpsertCartItem: mocks.handleUpsertCartItem,
    handleDeleteCartItem: mocks.handleDeleteCartItem,
  }),
}));

const variantKey = getCartVariantKey(cartItemFixture);

describe('CartContent', () => {
  beforeEach(() => {
    mocks.quantities = {};
    mocks.isCartVariantAdding.mockReturnValue(false);
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
    mocks.isCartVariantAdding.mockReturnValue(true);

    render(<CartContent item={cartItemFixture} />);

    expect(screen.getByRole('button', { name: '상품 삭제' })).toBeDisabled();
  });
});
