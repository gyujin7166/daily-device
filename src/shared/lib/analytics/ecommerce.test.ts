import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  toEcommerceItem,
  trackEcommerceEvent,
  trackPurchaseEvent,
} from './ecommerce';

const input = {
  productId: 101,
  product: {
    name_en: 'Mouse',
    price: 79_000,
    category: { name_en: 'Mice' },
  },
  colorName: 'Graphite',
  quantity: 3,
};

afterEach(() => vi.unstubAllGlobals());

describe('GA4 ecommerce', () => {
  it('상품 데이터에서 허용한 item 필드만 변환한다', () => {
    expect(toEcommerceItem(input)).toEqual({
      item_id: '101',
      item_name: 'Mouse',
      item_category: 'Mice',
      item_variant: 'Graphite',
      price: 79_000,
      quantity: 3,
    });
  });

  it.each([undefined, null, ''])('없는 선택 필드(%s)는 생략한다', (value) => {
    expect(
      toEcommerceItem({
        ...input,
        product: { ...input.product, category: undefined },
        colorName: value,
      }),
    ).toEqual({
      item_id: '101',
      item_name: 'Mouse',
      price: 79_000,
      quantity: 3,
    });
  });

  it('빈 category도 전송하지 않는다', () => {
    expect(
      toEcommerceItem({
        ...input,
        product: { ...input.product, category: { name_en: '' } },
      }),
    ).not.toHaveProperty('item_category');
  });

  it.each(['view_item', 'add_to_cart', 'begin_checkout'] as const)(
    '%s에 KRW와 실제 상품 합계를 전달한다',
    (event) => {
      const gtag = vi.fn();
      vi.stubGlobal('gtag', gtag);
      const items = [toEcommerceItem(input)];

      trackEcommerceEvent(event, items);

      expect(gtag).toHaveBeenCalledExactlyOnceWith('event', event, {
        currency: 'KRW',
        value: 237_000,
        items,
      });
    },
  );

  it('gtag가 없는 환경에서 조용히 종료한다', () => {
    vi.stubGlobal('gtag', undefined);
    expect(() =>
      trackEcommerceEvent('view_item', [toEcommerceItem(input)]),
    ).not.toThrow();
  });

  it('서버 환경에서 조용히 종료한다', () => {
    vi.stubGlobal('window', undefined);
    expect(() =>
      trackEcommerceEvent('view_item', [toEcommerceItem(input)]),
    ).not.toThrow();
  });
});

describe('GA4 purchase', () => {
  const purchase = {
    transactionId: 'DD-purchase-1',
    value: 111_000,
    items: [
      {
        productId: 101,
        productName: 'Server Mouse',
        colorName: 'Black',
        price: 40_000,
        quantity: 2,
      },
    ],
  };
  const marker = `ga4:purchase:${purchase.transactionId}`;

  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('서버 금액과 허용한 item 필드만 전송하고 성공 후 marker를 저장한다', () => {
    const gtag = vi.fn(() => {
      expect(window.sessionStorage.getItem(marker)).toBeNull();
    });
    vi.stubGlobal('gtag', gtag);

    expect(trackPurchaseEvent(purchase)).toBe(true);
    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'purchase', {
      transaction_id: purchase.transactionId,
      currency: 'KRW',
      value: purchase.value,
      items: [
        {
          item_id: '101',
          item_name: 'Server Mouse',
          item_variant: 'Black',
          price: 40_000,
          quantity: 2,
        },
      ],
    });
    expect(window.sessionStorage.getItem(marker)).toBeTruthy();
  });

  it('동일 transaction은 한 번만 전송한다', () => {
    const gtag = vi.fn();
    vi.stubGlobal('gtag', gtag);
    expect(trackPurchaseEvent(purchase)).toBe(true);
    expect(trackPurchaseEvent(purchase)).toBe(false);
    expect(gtag).toHaveBeenCalledOnce();
  });

  it.each([null, ''])('색상이 %s이면 variant를 생략한다', (colorName) => {
    const gtag = vi.fn();
    vi.stubGlobal('gtag', gtag);
    trackPurchaseEvent({
      ...purchase,
      items: [{ ...purchase.items[0], colorName }],
    });
    expect(gtag.mock.calls[0]?.[2].items[0]).not.toHaveProperty('item_variant');
  });

  it.each([{ transactionId: '' }, { transactionId: '  ' }, { items: [] }])(
    '유효하지 않은 구매(%j)는 전송하지 않는다',
    (invalid) => {
      const gtag = vi.fn();
      vi.stubGlobal('gtag', gtag);
      expect(trackPurchaseEvent({ ...purchase, ...invalid })).toBe(false);
      expect(gtag).not.toHaveBeenCalled();
      expect(window.sessionStorage.getItem(marker)).toBeNull();
    },
  );

  it('gtag가 없으면 marker를 남기지 않아 나중에 재시도할 수 있다', () => {
    vi.stubGlobal('gtag', undefined);
    expect(trackPurchaseEvent(purchase)).toBe(false);
    expect(window.sessionStorage.getItem(marker)).toBeNull();
    const gtag = vi.fn();
    vi.stubGlobal('gtag', gtag);
    expect(trackPurchaseEvent(purchase)).toBe(true);
    expect(gtag).toHaveBeenCalledOnce();
  });

  it('gtag가 실패해도 예외를 전파하거나 marker를 남기지 않는다', () => {
    vi.stubGlobal(
      'gtag',
      vi.fn(() => {
        throw new Error('analytics unavailable');
      }),
    );
    expect(trackPurchaseEvent(purchase)).toBe(false);
    expect(window.sessionStorage.getItem(marker)).toBeNull();
  });

  it('storage가 차단되어도 예외 없이 구매를 전송한다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const gtag = vi.fn();
    vi.stubGlobal('gtag', gtag);
    expect(
      trackPurchaseEvent({
        ...purchase,
        transactionId: 'storage-blocked-order',
      }),
    ).toBe(true);
    expect(
      trackPurchaseEvent({
        ...purchase,
        transactionId: 'storage-blocked-order',
      }),
    ).toBe(false);
    expect(gtag).toHaveBeenCalledOnce();
  });

  it('서버 환경에서는 no-op이다', () => {
    vi.stubGlobal('window', undefined);
    expect(trackPurchaseEvent(purchase)).toBe(false);
  });
});
