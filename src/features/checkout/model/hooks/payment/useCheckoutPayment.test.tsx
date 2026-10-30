import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BUY_NOW_CHECKOUT_STORAGE_KEY,
  CHECKOUT_ENTRY_STORAGE_KEY,
} from '@shared/constants/checkout';

import { cartItemFixture } from '../../../../../../test/mocks/handlers';
import { useCheckoutStore } from '../../store/checkoutStore';

import { useCheckoutPayment } from './useCheckoutPayment';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  replace: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  sdk: vi.fn(),
  requestPayment: vi.fn(),
}));
vi.mock('@tanstack/react-query', () => ({ useIsMutating: () => 0 }));
vi.mock('@entities/order/queries/useCreateOrder', () => ({
  useCreateOrder: () => ({ mutateAsync: mocks.create, isPending: false }),
}));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@shared/lib/i18n/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock('@shared/lib/toast', () => ({
  toast: { success: mocks.success, error: mocks.error },
}));
vi.mock('../../lib/tossPayments', () => ({ loadTossPayments: mocks.sdk }));

const summary = {
  id: 301,
  orderNumber: 'DD-server-purchase',
  status: 'CONFIRMED',
  totalAmount: 1234,
  items: [
    {
      productId: 909,
      productName: 'Server Product',
      colorName: null,
      price: 617,
      quantity: 2,
    },
  ],
};

function setupDemo() {
  const hook = renderHook(() =>
    useCheckoutPayment({ items: [cartItemFixture] }),
  );
  act(() => hook.result.current.setSelectedMethod('demo'));
  return hook;
}

describe('checkout purchase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    useCheckoutStore.getState().actions.resetCheckoutState();
    useCheckoutStore.getState().actions.setSelectedAddressId(1);
    mocks.create.mockResolvedValue(summary);
    mocks.sdk.mockResolvedValue(() => ({
      requestPayment: mocks.requestPayment,
    }));
    window.sessionStorage.setItem(CHECKOUT_ENTRY_STORAGE_KEY, 'buyNow');
    window.sessionStorage.setItem(BUY_NOW_CHECKOUT_STORAGE_KEY, 'snapshot');
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('CONFIRMED 응답의 주문번호·서버 금액·상품만 purchase로 보내고 완료한다', async () => {
    const gtag = vi.fn();
    vi.stubGlobal('gtag', gtag);
    const { result } = setupDemo();
    await act(async () => result.current.handlePay());

    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'CONFIRMED' }),
    );
    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'purchase', {
      transaction_id: summary.orderNumber,
      currency: 'KRW',
      value: summary.totalAmount,
      items: [
        {
          item_id: '909',
          item_name: 'Server Product',
          price: 617,
          quantity: 2,
        },
      ],
    });
    expect(mocks.replace).toHaveBeenCalledWith('/my/orders');
    expect(mocks.success).toHaveBeenCalledOnce();
    expect(
      window.sessionStorage.getItem(CHECKOUT_ENTRY_STORAGE_KEY),
    ).toBeNull();
    expect(
      window.sessionStorage.getItem(BUY_NOW_CHECKOUT_STORAGE_KEY),
    ).toBeNull();
    expect(
      window.sessionStorage.getItem(`ga4:purchase:${summary.orderNumber}`),
    ).toBeTruthy();
  });

  it('주문 생성 실패에는 purchase와 완료 이동이 없다', async () => {
    vi.stubGlobal('gtag', vi.fn());
    mocks.create.mockRejectedValue(new Error('Order failed'));
    const { result } = setupDemo();
    await act(async () => result.current.handlePay());
    expect(window.gtag).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(mocks.error).toHaveBeenCalledOnce();
    expect(window.sessionStorage.getItem(CHECKOUT_ENTRY_STORAGE_KEY)).toBe(
      'buyNow',
    );
  });

  it('CONFIRMED가 아닌 주문은 purchase를 보내지 않는다', async () => {
    vi.stubGlobal('gtag', vi.fn());
    mocks.create.mockResolvedValue({ ...summary, status: 'PENDING' });
    const { result } = setupDemo();
    await act(async () => result.current.handlePay());
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it.each(['missing', 'throwing'] as const)(
    'gtag %s도 주문 완료와 이동을 방해하지 않는다',
    async (mode) => {
      vi.stubGlobal(
        'gtag',
        mode === 'missing'
          ? undefined
          : vi.fn(() => {
              throw new Error('analytics failed');
            }),
      );
      const { result } = setupDemo();
      await act(async () => result.current.handlePay());
      expect(mocks.replace).toHaveBeenCalledWith('/my/orders');
      expect(mocks.success).toHaveBeenCalledOnce();
      expect(mocks.error).not.toHaveBeenCalled();
    },
  );

  it('같은 주문번호를 다시 처리해도 purchase는 한 번만 호출한다', async () => {
    const gtag = vi.fn();
    vi.stubGlobal('gtag', gtag);
    const { result } = setupDemo();
    await act(async () => result.current.handlePay());
    await act(async () => result.current.handlePay());
    expect(gtag).toHaveBeenCalledOnce();
  });

  it.each([false, true])(
    'Toss PENDING 생성과 결제창 호출 시 purchase 없이 recovery를 유지한다 (buyNow=%s)',
    async (isBuyNow) => {
      vi.stubEnv('NEXT_PUBLIC_TOSS_CLIENT_KEY', 'test_ck_for_test');
      vi.stubGlobal('gtag', vi.fn());
      mocks.create.mockResolvedValue({ ...summary, status: 'PENDING' });
      const { result } = renderHook(() =>
        useCheckoutPayment({ items: [cartItemFixture], isBuyNow }),
      );
      await act(async () => result.current.handlePay());
      expect(mocks.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'PENDING', isBuyNow }),
      );
      expect(mocks.requestPayment).toHaveBeenCalledOnce();
      expect(window.gtag).not.toHaveBeenCalled();
      expect(window.sessionStorage.getItem(CHECKOUT_ENTRY_STORAGE_KEY)).toBe(
        isBuyNow ? 'buyNow' : 'cart',
      );
    },
  );
});
