import type React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import { useCartPendingStore } from '@entities/cart/model/store/cartPendingStore';

import ProductItem from './ProductItem';

const mocks = vi.hoisted(() => ({
  handleUpsertCartItem: vi.fn(),
  openCart: vi.fn(),
  useCartActions: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/products',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) =>
    key === 'addToCart' ? '장바구니에 추가' : key,
}));

vi.mock('@shared/lib/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/products',
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
}));

vi.mock('@entities/cart/model/hooks/useCartActions', () => ({
  default: () => {
    mocks.useCartActions();

    return {
      handleUpsertCartItem: mocks.handleUpsertCartItem,
    };
  },
}));

vi.mock('@entities/cart/model/store/cartDrawerStore', () => ({
  useCartDrawerStore: () => ({ openCart: mocks.openCart }),
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
    useCartPendingStore.getState().actions.resetPendingState();
  });

  it('동일한 상품 props로 부모가 다시 렌더되어도 상품 행 렌더를 생략한다', () => {
    const product = {
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
    };
    const { rerender } = render(
      <ProductItem variant="catalog" product={product} />,
    );

    expect(mocks.useCartActions).toHaveBeenCalledTimes(1);

    rerender(<ProductItem variant="catalog" product={product} />);

    expect(mocks.useCartActions).toHaveBeenCalledTimes(1);
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

  it('동일 상품이 pending 상태이면 장바구니 버튼을 비활성화한다', () => {
    const variantKey = getCartVariantKey({ productId: 101 });
    useCartPendingStore.getState().actions.startCartSync(variantKey);

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

    expect(
      screen.getByRole('button', { name: '장바구니에 추가' }),
    ).toBeDisabled();
  });
});
