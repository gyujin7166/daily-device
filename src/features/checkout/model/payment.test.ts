import { describe, expect, it } from 'vitest';

import type { UserCartItem } from '@entities/cart/model/types';

import {
  buildCheckoutOrderPayload,
  buildCheckoutShipping,
  getCheckoutOrderName,
  getCheckoutPaymentActionLabel,
  isCheckoutShippingReady,
  validateCheckoutBeforePay,
} from './payment';

const createCartItem = ({
  id,
  productId,
  productName,
  productColorId = null,
  quantity = 1,
}: {
  id: number;
  productId: number;
  productName: string;
  productColorId?: number | null;
  quantity?: number;
}): UserCartItem => ({
  id,
  productId,
  productColorId,
  colorName: null,
  quantity,
  product: {
    id: productId,
    name_en: productName,
    slug: `product-${productId}`,
    price: 10_000,
    image_url: '/images/product.webp',
  },
});

const checkoutItems = [
  createCartItem({
    id: 1,
    productId: 10,
    productName: 'MX MASTER',
    productColorId: 3,
    quantity: 2,
  }),
  createCartItem({ id: 2, productId: 20, productName: 'KEYBOARD' }),
];

const shipping = {
  recipientName: '홍길동',
  recipientPhone: '010-1234-5678',
  address1: '서울시 강남구',
  address2: '101호',
};

describe('checkout shipping', () => {
  it('배송지 입력값의 앞뒤 공백을 제거하고 빈 상세 주소를 생략한다', () => {
    expect(
      buildCheckoutShipping({
        name: ' 홍길동 ',
        phoneNumber: ' 010-1234-5678 ',
        address1: ' 서울시 강남구 ',
        address2: '   ',
      }),
    ).toEqual({
      recipientName: '홍길동',
      recipientPhone: '010-1234-5678',
      address1: '서울시 강남구',
      address2: undefined,
    });
  });

  it('저장 배송지 또는 필수 직접 입력값이 있으면 결제 준비가 완료된다', () => {
    expect(isCheckoutShippingReady(true, buildCheckoutShipping({}))).toBe(true);
    expect(isCheckoutShippingReady(false, shipping)).toBe(true);
    expect(isCheckoutShippingReady(false, { ...shipping, address1: '' })).toBe(
      false,
    );
  });
});

describe('validateCheckoutBeforePay', () => {
  it.each([
    {
      params: {
        isShippingReady: false,
        isUsingSavedAddress: false,
        isFormValid: false,
        isCartReady: false,
      },
      expected: '배송지 정보를 입력해주세요.',
    },
    {
      params: {
        isShippingReady: true,
        isUsingSavedAddress: false,
        isFormValid: false,
        isCartReady: true,
      },
      expected: '배송지 정보를 확인해주세요.',
    },
    {
      params: {
        isShippingReady: true,
        isUsingSavedAddress: true,
        isFormValid: false,
        isCartReady: false,
      },
      expected: '장바구니가 비어있습니다.',
    },
    {
      params: {
        isShippingReady: true,
        isUsingSavedAddress: true,
        isFormValid: false,
        isCartReady: true,
      },
      expected: null,
    },
  ])('$expected', ({ params, expected }) => {
    expect(validateCheckoutBeforePay(params)).toBe(expected);
  });
});

describe('checkout order', () => {
  it('상품 수에 맞는 주문명을 만든다', () => {
    expect(getCheckoutOrderName([checkoutItems[0]])).toBe('MX MASTER');
    expect(getCheckoutOrderName(checkoutItems)).toBe('MX MASTER 외 1건');
  });

  it('저장 배송지를 선택하면 일회성 배송지를 payload에서 제외한다', () => {
    const payload = buildCheckoutOrderPayload({
      checkoutItems,
      selectedAddressId: 7,
      shipping,
      status: 'PENDING',
      isBuyNow: false,
    });

    expect(payload).toEqual({
      items: [
        { productId: 10, productColorId: 3, quantity: 2 },
        { productId: 20, productColorId: undefined, quantity: 1 },
      ],
      userAddressId: 7,
      status: 'PENDING',
      isBuyNow: false,
    });
    expect(payload).not.toHaveProperty('shipping');
  });

  it('저장 배송지가 없으면 일회성 배송지를 payload에 포함한다', () => {
    const payload = buildCheckoutOrderPayload({
      checkoutItems,
      selectedAddressId: null,
      shipping,
      status: 'CONFIRMED',
      isBuyNow: true,
    });

    expect(payload).toMatchObject({
      shipping,
      status: 'CONFIRMED',
      isBuyNow: true,
    });
    expect(payload).not.toHaveProperty('userAddressId');
  });
});

describe('getCheckoutPaymentActionLabel', () => {
  it.each([
    {
      params: {
        isCartMutating: true,
        selectedMethod: 'test' as const,
        isRequestingPayment: true,
        isDemoProcessing: false,
      },
      expected: '장바구니 반영 중...',
    },
    {
      params: {
        isCartMutating: false,
        selectedMethod: 'test' as const,
        isRequestingPayment: true,
        isDemoProcessing: false,
      },
      expected: '결제 요청 중...',
    },
    {
      params: {
        isCartMutating: false,
        selectedMethod: 'demo' as const,
        isRequestingPayment: false,
        isDemoProcessing: true,
      },
      expected: '처리 중...',
    },
    {
      params: {
        isCartMutating: false,
        selectedMethod: 'demo' as const,
        isRequestingPayment: false,
        isDemoProcessing: false,
      },
      expected: '데모 결제',
    },
  ])('$expected', ({ params, expected }) => {
    expect(getCheckoutPaymentActionLabel(params)).toBe(expected);
  });
});
