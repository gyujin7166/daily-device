import { afterEach, describe, expect, it, vi } from 'vitest';

import { toEcommerceItem, trackEcommerceEvent } from './ecommerce';

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
