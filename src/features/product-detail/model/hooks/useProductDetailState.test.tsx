import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useProductDetailState from './useProductDetailState';

const mocks = vi.hoisted(() => ({
  sessionStatus: 'loading' as 'loading' | 'authenticated' | 'unauthenticated',
  useSearchParams: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => {
    mocks.useSearchParams();
    return new URLSearchParams();
  },
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: mocks.sessionStatus }),
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'ko',
}));

vi.mock('@shared/lib/i18n/navigation', () => ({
  usePathname: () => '/products/mice/aster-mouse-mini',
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@entities/cart/model/hooks/useCartActions', () => ({
  default: () => ({ handleUpsertCartItem: vi.fn() }),
}));

vi.mock('@entities/product/queries/useProductDescription', () => ({
  useProductDescription: () => ({ data: undefined, isPending: false }),
}));

vi.mock('@entities/product/queries/useProductImages', () => ({
  useProductImages: () => ({ data: [] }),
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

describe('useProductDetailState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sessionStatus = 'loading';
  });

  it('세션 로딩 상태를 초기 장바구니 버튼 disabled 값에 반영하지 않는다', () => {
    const { result } = renderHook(() =>
      useProductDetailState({ detail: 'aster-mouse-mini' }),
    );

    expect(result.current.isAddToCartDisabled).toBe(false);
  });

  it('현재 URL은 사용자 이벤트 전까지 search params를 구독하지 않는다', () => {
    renderHook(() => useProductDetailState({ detail: 'aster-mouse-mini' }));

    expect(mocks.useSearchParams).not.toHaveBeenCalled();
  });
});
