import { describe, expect, it } from 'vitest';

import { getCartVariantKey, isSameCartVariant } from './cartItemVariant';

describe('getCartVariantKey', () => {
  it('상품 색상 ID를 색상명보다 우선한다', () => {
    expect(
      getCartVariantKey({
        productId: 10,
        productColorId: 3,
        colorName: 'Black',
      }),
    ).toBe('10:id:3');
  });

  it('색상 ID가 없으면 정규화한 색상명을 사용한다', () => {
    expect(
      getCartVariantKey({
        productId: 10,
        productColorId: null,
        colorName: '  Space Gray  ',
      }),
    ).toBe('10:name:space gray');
  });

  it('색상 정보가 없으면 색상 없는 상품 키를 만든다', () => {
    expect(getCartVariantKey({ productId: 10, colorName: '   ' })).toBe(
      '10:none',
    );
  });
});

describe('isSameCartVariant', () => {
  it('색상명의 공백과 대소문자가 달라도 같은 장바구니 항목으로 판단한다', () => {
    expect(
      isSameCartVariant(
        { productId: 10, colorName: 'Black' },
        { productId: 10, colorName: ' black ' },
      ),
    ).toBe(true);
  });

  it('상품이나 색상이 다르면 다른 장바구니 항목으로 판단한다', () => {
    expect(
      isSameCartVariant(
        { productId: 10, productColorId: 1 },
        { productId: 10, productColorId: 2 },
      ),
    ).toBe(false);
    expect(
      isSameCartVariant(
        { productId: 10, productColorId: 1 },
        { productId: 11, productColorId: 1 },
      ),
    ).toBe(false);
  });
});
