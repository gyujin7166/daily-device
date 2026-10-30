import { StrictMode } from 'react';

import { act, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BUY_NOW_CHECKOUT_STORAGE_KEY,
  CHECKOUT_ENTRY_STORAGE_KEY,
} from '@shared/constants/checkout';

import { TEST_API_URL } from '../../../../../../test/mocks/handlers';
import { server } from '../../../../../../test/mocks/server';

import TossSuccessContainer from './TossSuccessContainer';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  query: 'paymentKey=test-key&orderId=DD-toss-purchase&amount=1234',
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(mocks.query),
}));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@shared/lib/i18n/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

const summary = {
  orderNumber: 'DD-toss-purchase',
  status: 'CONFIRMED',
  totalAmount: 1234,
  items: [
    {
      productId: 909,
      productName: 'Server Product',
      colorName: 'Black',
      price: 617,
      quantity: 2,
    },
  ],
};

describe('Toss success purchase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query = 'paymentKey=test-key&orderId=DD-toss-purchase&amount=1234';
    window.sessionStorage.clear();
    window.sessionStorage.setItem(CHECKOUT_ENTRY_STORAGE_KEY, 'buyNow');
    window.sessionStorage.setItem(BUY_NOW_CHECKOUT_STORAGE_KEY, 'snapshot');
    server.use(
      http.post(`${TEST_API_URL}/api/payments/toss/confirm`, () =>
        HttpResponse.json({ items: summary, message: 'Payment confirmed' }),
      ),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('confirm 성공 뒤에만 purchase를 보내고 recovery만 정리한 뒤 이동한다', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.post(`${TEST_API_URL}/api/payments/toss/confirm`, async () => {
        await gate;
        return HttpResponse.json({ items: summary });
      }),
    );
    const gtag = vi.fn();
    vi.stubGlobal('gtag', gtag);
    render(<TossSuccessContainer />);
    expect(gtag).not.toHaveBeenCalled();
    await act(async () => {
      release();
    });
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith('/my/orders'),
    );
    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'purchase', {
      transaction_id: summary.orderNumber,
      currency: 'KRW',
      value: summary.totalAmount,
      items: [
        {
          item_id: '909',
          item_name: 'Server Product',
          item_variant: 'Black',
          price: 617,
          quantity: 2,
        },
      ],
    });
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

  it('StrictMode와 rerender에서도 confirm과 purchase를 한 번만 실행한다', async () => {
    let requests = 0;
    server.use(
      http.post(`${TEST_API_URL}/api/payments/toss/confirm`, () => {
        requests += 1;
        return HttpResponse.json({ items: summary });
      }),
    );
    const gtag = vi.fn();
    vi.stubGlobal('gtag', gtag);
    const view = render(
      <StrictMode>
        <TossSuccessContainer />
      </StrictMode>,
    );
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith('/my/orders'),
    );
    view.rerender(
      <StrictMode>
        <TossSuccessContainer />
      </StrictMode>,
    );
    expect(requests).toBe(1);
    expect(gtag).toHaveBeenCalledOnce();
  });

  it('새로 mount해도 이미 전송한 transaction은 purchase를 반복하지 않는다', async () => {
    const gtag = vi.fn();
    vi.stubGlobal('gtag', gtag);
    const first = render(<TossSuccessContainer />);
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledOnce());
    first.unmount();
    render(<TossSuccessContainer />);
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledTimes(2));
    expect(gtag).toHaveBeenCalledOnce();
  });

  it('confirm 실패에는 purchase와 완료 이동이 없다', async () => {
    vi.stubGlobal('gtag', vi.fn());
    server.use(
      http.post(`${TEST_API_URL}/api/payments/toss/confirm`, () =>
        HttpResponse.json({ message: 'Rejected' }, { status: 400 }),
      ),
    );
    render(<TossSuccessContainer />);
    await screen.findByText('error.title');
    expect(window.gtag).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem(CHECKOUT_ENTRY_STORAGE_KEY)).toBe(
      'buyNow',
    );
  });

  it('확정 상태가 아닌 응답은 purchase를 전송하지 않는다', async () => {
    vi.stubGlobal('gtag', vi.fn());
    server.use(
      http.post(`${TEST_API_URL}/api/payments/toss/confirm`, () =>
        HttpResponse.json({ items: { ...summary, status: 'PENDING' } }),
      ),
    );
    render(<TossSuccessContainer />);
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith('/my/orders'),
    );
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it.each(['missing', 'throwing'] as const)(
    'gtag %s에도 결제 완료 처리를 유지한다',
    async (mode) => {
      vi.stubGlobal(
        'gtag',
        mode === 'missing'
          ? undefined
          : vi.fn(() => {
              throw new Error('analytics failed');
            }),
      );
      render(<TossSuccessContainer />);
      await waitFor(() =>
        expect(mocks.replace).toHaveBeenCalledWith('/my/orders'),
      );
      expect(screen.queryByText('error.title')).not.toBeInTheDocument();
    },
  );

  it.each([
    '',
    'paymentKey=&orderId=order&amount=1234',
    'paymentKey=key&orderId=&amount=1234',
    'paymentKey=key&orderId=order&amount=abc',
    'paymentKey=key&orderId=order&amount=-1',
    'paymentKey=key&orderId=order&amount=Infinity',
  ])(
    '잘못된 callback(%s)은 confirm과 purchase를 실행하지 않는다',
    async (query) => {
      mocks.query = query;
      let requests = 0;
      server.use(
        http.post(`${TEST_API_URL}/api/payments/toss/confirm`, () => {
          requests += 1;
          return HttpResponse.json({ items: summary });
        }),
      );
      vi.stubGlobal('gtag', vi.fn());
      render(<TossSuccessContainer />);
      await screen.findByText('error.title');
      expect(requests).toBe(0);
      expect(window.gtag).not.toHaveBeenCalled();
    },
  );
});
