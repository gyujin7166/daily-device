import { describe, expect, it } from 'vitest';

import { getProductPriceInfo } from './discount';

describe('getProductPriceInfo', () => {
  it('할인 가격과 표시 문구를 계산한다', () => {
    expect(getProductPriceInfo(125_000, 20)).toEqual({
      price: 100_000,
      originalPrice: 125_000,
      discountedPrice: 100_000,
      discountRate: 20,
      isDiscounted: true,
      priceLabel: '100,000원',
      originalPriceLabel: '125,000원',
      discountedPriceLabel: '100,000원',
    });
  });

  it.each([
    { discountRate: -10, expectedDiscountRate: 0 },
    { discountRate: Number.NaN, expectedDiscountRate: 0 },
    { discountRate: Number.POSITIVE_INFINITY, expectedDiscountRate: 0 },
    { discountRate: 10.9, expectedDiscountRate: 10 },
    { discountRate: 120, expectedDiscountRate: 100 },
  ])(
    '할인율 $discountRate을 $expectedDiscountRate으로 정규화한다',
    ({ discountRate, expectedDiscountRate }) => {
      expect(getProductPriceInfo(10_000, discountRate).discountRate).toBe(
        expectedDiscountRate,
      );
    },
  );

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1])(
    '유효하지 않은 가격 %s을 0원으로 처리한다',
    (price) => {
      expect(getProductPriceInfo(price, 20)).toMatchObject({
        price: 0,
        originalPrice: 0,
        discountedPrice: 0,
        isDiscounted: false,
        priceLabel: '0원',
      });
    },
  );

  it('할인율이 없으면 원래 가격을 유지한다', () => {
    expect(getProductPriceInfo(30_000)).toMatchObject({
      price: 30_000,
      originalPrice: 30_000,
      discountedPrice: 30_000,
      discountRate: 0,
      isDiscounted: false,
    });
  });
});
