import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BUY_NOW_CHECKOUT_STORAGE_KEY,
  CHECKOUT_ENTRY_STORAGE_KEY,
} from '@shared/constants/checkout';

import { cartItemFixture } from '../../../../../../test/mocks/handlers';
import { useCheckoutStore } from '../../store/checkoutStore';

import useCheckoutPageState from './useCheckoutPageState';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  setParam: vi.fn(),
  setSelectedMethod: vi.fn(),
  handlePay: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@entities/cart/queries/useCart', () => ({
  selectCartItems: vi.fn(),
  useCart: () => ({ data: [], isPending: false }),
}));

vi.mock('@shared/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: mocks.replace }),
}));

vi.mock('@shared/lib/router/useQueryParams', () => ({
  useQueryParams: () => ({ setParam: mocks.setParam }),
}));

vi.mock('../payment/useCheckoutPayment', () => ({
  useCheckoutPayment: () => ({
    actionLabel: '결제',
    handlePay: mocks.handlePay,
    isActionDisabled: false,
    isBusy: false,
    isCartSyncPending: false,
    selectedMethod: 'test',
    setSelectedMethod: mocks.setSelectedMethod,
  }),
}));

describe('useCheckoutPageState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    useCheckoutStore.getState().actions.resetCheckoutState();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('배송지 모달 상태 변경을 페이지 수준에서 구독하지 않는다', async () => {
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useCheckoutPageState();
    });

    await waitFor(() => {
      expect(result.current.checkoutViewState).toBe('empty');
    });
    const renderCountBeforeModalOpen = renderCount;

    act(() => {
      useCheckoutStore.getState().actions.setIsAddressModalOpen(true);
    });

    expect(renderCount).toBe(renderCountBeforeModalOpen);
  });

  it('저장된 checkout을 mount하거나 새로고침해도 begin_checkout을 다시 전송하지 않는다', async () => {
    const gtag = vi.fn();
    vi.stubGlobal('gtag', gtag);
    window.sessionStorage.setItem(CHECKOUT_ENTRY_STORAGE_KEY, 'buyNow');
    window.sessionStorage.setItem(
      BUY_NOW_CHECKOUT_STORAGE_KEY,
      JSON.stringify([cartItemFixture]),
    );
    const firstVisit = renderHook(useCheckoutPageState);
    await waitFor(() =>
      expect(firstVisit.result.current.checkoutViewState).toBe('checkout'),
    );
    firstVisit.unmount();
    const refresh = renderHook(useCheckoutPageState);
    await waitFor(() =>
      expect(refresh.result.current.checkoutViewState).toBe('checkout'),
    );
    expect(gtag).not.toHaveBeenCalled();
  });
});
