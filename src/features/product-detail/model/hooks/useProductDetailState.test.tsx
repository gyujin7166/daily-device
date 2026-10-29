import { StrictMode } from 'react';

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProductDetailResponse } from '@entities/product/model/types';

import {
  BUY_NOW_CHECKOUT_STORAGE_KEY,
  CHECKOUT_ENTRY_STORAGE_KEY,
} from '@shared/constants/checkout';

import useProductDetailState from './useProductDetailState';

const mocks = vi.hoisted(() => ({
  sessionStatus: 'loading' as 'loading' | 'authenticated' | 'unauthenticated',
  useSearchParams: vi.fn(),
  push: vi.fn(),
  handleUpsertCartItem: vi.fn(),
  productData: undefined as ProductDetailResponse | undefined,
  isPending: false,
  isSuccess: true,
  isPlaceholderData: false,
  isError: false,
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
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@entities/cart/model/hooks/useCartActions', () => ({
  default: () => ({ handleUpsertCartItem: mocks.handleUpsertCartItem }),
}));

vi.mock('@entities/product/queries/useProductDescription', () => ({
  useProductDescription: () => ({
    data: mocks.productData,
    isPending: mocks.isPending,
    isSuccess: mocks.isSuccess,
    isPlaceholderData: mocks.isPlaceholderData,
    isError: mocks.isError,
  }),
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

const product = (
  slug = 'aster-mouse-mini',
  id = 101,
): NonNullable<ProductDetailResponse['product']> => ({
  id,
  slug,
  name_en: slug,
  productLine: null,
  description: '',
  detailed_description: '',
  price: 79_000,
  originalPrice: 100_000,
  discountedPrice: 79_000,
  discountRate: 21,
  isDiscounted: true,
  priceLabel: '79,000원',
  originalPriceLabel: '100,000원',
  discountedPriceLabel: '79,000원',
  category: { name_en: 'Mice', name_ko: '마우스', slug: 'mice' },
  productColor: [],
});

const gtag = vi.fn();

describe('useProductDetailState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sessionStatus = 'loading';
    mocks.productData = undefined;
    mocks.isPending = false;
    mocks.isSuccess = true;
    mocks.isPlaceholderData = false;
    mocks.isError = false;
    window.sessionStorage.clear();
    vi.stubGlobal('gtag', gtag);
  });

  afterEach(() => vi.unstubAllGlobals());

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

  it('실제 상품이 준비되면 StrictMode와 rerender에서도 view_item은 한 번만 전송한다', () => {
    const { rerender } = renderHook(
      () => useProductDetailState({ detail: 'aster-mouse-mini' }),
      { wrapper: StrictMode },
    );
    expect(gtag).not.toHaveBeenCalled();

    mocks.productData = { product: product(), productDetails: [] };
    rerender();
    rerender();

    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'view_item', {
      currency: 'KRW',
      value: 79_000,
      items: [
        {
          item_id: '101',
          item_name: 'aster-mouse-mini',
          item_category: 'Mice',
          price: 79_000,
          quantity: 1,
        },
      ],
    });
  });

  it.each(['loading', 'error', 'placeholder', 'wrong-slug'])(
    '%s 상품 데이터로 view_item을 보내지 않는다',
    (state) => {
      mocks.productData = { product: product(), productDetails: [] };
      mocks.isPending = state === 'loading';
      mocks.isSuccess = state !== 'loading' && state !== 'error';
      mocks.isError = state === 'error';
      mocks.isPlaceholderData = state === 'placeholder';
      renderHook(() =>
        useProductDetailState({
          detail: state === 'wrong-slug' ? 'another-mouse' : 'aster-mouse-mini',
        }),
      );
      expect(gtag).not.toHaveBeenCalled();
    },
  );

  it('A → B placeholder → B 데이터 → A 재방문마다 실제 상품만 한 번 전송한다', () => {
    mocks.productData = { product: product(), productDetails: [] };
    const { rerender } = renderHook(
      ({ detail }) => useProductDetailState({ detail }),
      { initialProps: { detail: 'aster-mouse-mini' } },
    );
    expect(gtag).toHaveBeenCalledTimes(1);

    mocks.isPlaceholderData = true;
    rerender({ detail: 'another-mouse' });
    expect(gtag).toHaveBeenCalledTimes(1);

    mocks.isPlaceholderData = false;
    mocks.productData = {
      product: product('another-mouse', 102),
      productDetails: [],
    };
    rerender({ detail: 'another-mouse' });
    rerender({ detail: 'another-mouse' });
    expect(gtag).toHaveBeenCalledTimes(2);
    expect(gtag.mock.calls[1][2].items[0].item_id).toBe('102');

    mocks.productData = { product: product(), productDetails: [] };
    rerender({ detail: 'aster-mouse-mini' });
    expect(gtag).toHaveBeenCalledTimes(3);
  });

  it('상세 Add to Cart 호출에 명시적 추가 의도와 선택 수량을 전달한다', () => {
    mocks.sessionStatus = 'unauthenticated';
    mocks.productData = { product: product(), productDetails: [] };
    const { result } = renderHook(() =>
      useProductDetailState({ detail: 'aster-mouse-mini' }),
    );
    act(() => {
      result.current.increaseQuantity();
      result.current.increaseQuantity();
    });
    act(() => result.current.handleAddToCart());
    expect(mocks.handleUpsertCartItem).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 101,
        quantity: 3,
        trackAddToCart: true,
      }),
    );
  });

  it('Buy Now 저장 후 이동 전에 선택 색상·수량의 begin_checkout을 전송한다', () => {
    mocks.productData = { product: product(), productDetails: [] };
    const { result } = renderHook(() =>
      useProductDetailState({ detail: 'aster-mouse-mini' }),
    );
    act(() => {
      result.current.handleColorChange({ id: 201, name: 'Graphite' });
      result.current.increaseQuantity();
    });
    gtag.mockClear();
    gtag.mockImplementationOnce(() => {
      expect(window.sessionStorage.getItem(CHECKOUT_ENTRY_STORAGE_KEY)).toBe(
        'buyNow',
      );
      expect(
        JSON.parse(
          window.sessionStorage.getItem(BUY_NOW_CHECKOUT_STORAGE_KEY) ?? '[]',
        )[0].quantity,
      ).toBe(2);
      expect(mocks.push).not.toHaveBeenCalled();
    });
    act(() => result.current.handleBuyNow());
    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'begin_checkout', {
      currency: 'KRW',
      value: 158_000,
      items: [
        {
          item_id: '101',
          item_name: 'aster-mouse-mini',
          item_category: 'Mice',
          item_variant: 'Graphite',
          price: 79_000,
          quantity: 2,
        },
      ],
    });
    expect(mocks.push).toHaveBeenCalledExactlyOnceWith('/checkout');
  });

  it('Buy Now 상품이 없으면 이벤트나 이동이 없다', () => {
    const { result } = renderHook(() =>
      useProductDetailState({ detail: 'aster-mouse-mini' }),
    );
    act(() => result.current.handleBuyNow());
    expect(gtag).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('최초 effect 뒤 Google tag가 초기화되어도 상품 조회를 한 번 전송한다', async () => {
    vi.stubGlobal('gtag', undefined);
    mocks.productData = { product: product(), productDetails: [] };
    const { rerender } = renderHook(() =>
      useProductDetailState({ detail: 'aster-mouse-mini' }),
    );
    vi.stubGlobal('gtag', gtag);
    await waitFor(() => expect(gtag).toHaveBeenCalledTimes(1));
    rerender();
    expect(gtag).toHaveBeenCalledTimes(1);
  });
});
