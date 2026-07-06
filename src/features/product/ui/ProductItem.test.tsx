import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProductItem from './ProductItem';

const mocks = vi.hoisted(() => ({
  handleUpsertCartItem: vi.fn(),
  openCart: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/products',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
}));

vi.mock('@entities/cart/model/hooks/useCartActions', () => ({
  default: () => ({
    handleUpsertCartItem: mocks.handleUpsertCartItem,
  }),
}));

vi.mock('@entities/cart/model/context/CartContext', () => ({
  useCartContext: () => ({
    openCart: mocks.openCart,
    isCartVariantMutationPending: () => false,
  }),
}));

vi.mock('@entities/wishlist/queries/useWishlist', () => ({
  useWishlist: () => ({ data: [] }),
}));

vi.mock('@entities/wishlist/queries/useUpsertWishlist', () => ({
  useUpsertWishlist: () => ({ mutate: vi.fn() }),
}));

vi.mock('@entities/wishlist/queries/useDeleteWishlist', () => ({
  useDeleteWishlist: () => ({ mutate: vi.fn() }),
}));

describe('ProductItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('비회원이 장바구니 버튼을 누르면 상품 정보를 전달하고 drawer를 연다', async () => {
    const user = userEvent.setup();

    render(
      <ProductItem
        variant="catalog"
        product={{
          id: 101,
          name_en: 'Aster Mouse Mini',
          slug: 'aster-mouse-mini',
          price: 129_000,
          priceLabel: '129,000원',
          image_url: '/images/aster-mouse-mini.webp',
          category: {
            name_en: 'Mice',
            slug: 'mice',
          },
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: '장바구니에 추가' }));

    expect(mocks.handleUpsertCartItem).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 101,
        quantity: 1,
        product: expect.objectContaining({
          id: 101,
          name_en: 'Aster Mouse Mini',
          price: 129_000,
          image_url: '/images/aster-mouse-mini.webp',
        }),
      }),
    );
    expect(mocks.openCart).toHaveBeenCalledOnce();
  });
});
