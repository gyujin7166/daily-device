import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createOrderForUser } from './service';

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  productFindMany: vi.fn(),
  productColorFindMany: vi.fn(),
  orderCreate: vi.fn(),
  shippingCreate: vi.fn(),
  itemsCreateMany: vi.fn(),
  cartFindFirst: vi.fn(),
  cartDelete: vi.fn(),
}));
vi.mock('server-only', () => ({}));
vi.mock('prisma/prismaClientSingleton', () => ({
  default: { $transaction: mocks.transaction },
}));

const tx = {
  product: { findMany: mocks.productFindMany },
  productColor: { findMany: mocks.productColorFindMany },
  order: { create: mocks.orderCreate },
  orderShipping: { create: mocks.shippingCreate },
  orderItem: { createMany: mocks.itemsCreateMany },
  cart: { findFirst: mocks.cartFindFirst },
  cartItem: { deleteMany: mocks.cartDelete },
};
const params = {
  userId: 'private-user',
  items: [{ productId: 101, productColorId: 201, quantity: 99 }],
  shipping: {
    recipientName: 'Private Name',
    recipientPhone: '01000000000',
    address1: 'Private Address',
  },
};

describe('주문 생성 purchase summary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof tx) => unknown) => callback(tx),
    );
    mocks.productFindMany.mockResolvedValue([
      { id: 101, name_en: 'DB Mouse', price: 100_000, discountRate: 20 },
    ]);
    mocks.productColorFindMany.mockResolvedValue([
      { id: 201, productId: 101, color: { name: 'DB Black' } },
    ]);
    mocks.orderCreate.mockImplementation(async ({ data }) => ({
      id: 301,
      orderNumber: 'DD-server',
      status: data.status,
    }));
    mocks.cartFindFirst.mockResolvedValue({ id: 1 });
  });

  it.each(['CONFIRMED', 'PENDING'] as const)(
    '%s 응답에는 DB 할인 가격·검증된 수량·상품만 포함한다',
    async (status) => {
      const result = await createOrderForUser({ ...params, status });
      expect(result).toEqual({
        id: 301,
        orderNumber: 'DD-server',
        status,
        totalAmount: 800_000,
        items: [
          {
            productId: 101,
            productName: 'DB Mouse',
            colorName: 'DB Black',
            price: 80_000,
            quantity: 10,
          },
        ],
      });
      expect(mocks.itemsCreateMany).toHaveBeenCalledWith({
        data: [expect.objectContaining({ price: 80_000, quantity: 10 })],
      });
      expect(mocks.cartDelete).toHaveBeenCalledTimes(
        status === 'CONFIRMED' ? 1 : 0,
      );
    },
  );

  it('buyNow 확정 주문도 같은 요약을 반환하며 장바구니를 지우지 않는다', async () => {
    const result = await createOrderForUser({
      ...params,
      isBuyNow: true,
      status: 'CONFIRMED',
    });
    expect(result).toHaveProperty('items.0.price', 80_000);
    expect(mocks.cartDelete).not.toHaveBeenCalled();
  });

  it('잘못된 색상은 주문 생성 전에 거부한다', async () => {
    mocks.productColorFindMany.mockResolvedValue([]);
    await expect(createOrderForUser(params)).rejects.toThrow(
      'Invalid product color',
    );
    expect(mocks.orderCreate).not.toHaveBeenCalled();
  });
});
