import { beforeEach, describe, expect, it, vi } from 'vitest';

import { upsertCartItem } from './service';

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  queryRaw: vi.fn(),
  cartFindFirst: vi.fn(),
  cartCreate: vi.fn(),
  productColorFindFirst: vi.fn(),
  cartItemFindMany: vi.fn(),
  cartItemCreate: vi.fn(),
  cartItemUpdate: vi.fn(),
  cartItemDeleteMany: vi.fn(),
}));

vi.mock('server-only', () => ({}));

vi.mock('prisma/prismaClientSingleton', () => ({
  default: {
    $transaction: mocks.transaction,
  },
}));

describe('upsertCartItem', () => {
  const tx = {
    $queryRaw: mocks.queryRaw,
    cart: {
      findFirst: mocks.cartFindFirst,
      create: mocks.cartCreate,
    },
    productColor: {
      findFirst: mocks.productColorFindFirst,
    },
    cartItem: {
      findMany: mocks.cartItemFindMany,
      create: mocks.cartItemCreate,
      update: mocks.cartItemUpdate,
      deleteMany: mocks.cartItemDeleteMany,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof tx) => unknown) => callback(tx),
    );
    mocks.queryRaw.mockResolvedValue([{ id: 'user-1' }]);
    mocks.cartFindFirst.mockResolvedValue({ id: 1, userId: 'user-1' });
    mocks.productColorFindFirst.mockResolvedValue({
      id: 201,
      color: { name: 'Graphite' },
    });
    mocks.cartItemFindMany.mockResolvedValue([]);
    mocks.cartItemCreate.mockResolvedValue({
      id: 11,
      cartId: 1,
      productId: 101,
      productColorId: 201,
      colorName: 'Graphite',
      quantity: 1,
    });
  });

  it('장바구니를 조회하기 전에 사용자 행을 잠가 동시 쓰기를 직렬화한다', async () => {
    await upsertCartItem({
      userId: 'user-1',
      productId: 101,
      productColorId: 201,
      colorName: 'Graphite',
      quantity: 1,
    });

    expect(mocks.queryRaw).toHaveBeenCalledOnce();
    expect(mocks.queryRaw.mock.calls[0]?.[1]).toBe('user-1');
    expect(mocks.queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.cartFindFirst.mock.invocationCallOrder[0],
    );
  });

  it('같은 상품 variant의 기존 중복 행을 하나로 정리한다', async () => {
    mocks.cartItemFindMany.mockResolvedValue([{ id: 11 }, { id: 12 }]);
    mocks.cartItemUpdate.mockResolvedValue({
      id: 11,
      cartId: 1,
      productId: 101,
      productColorId: 201,
      colorName: 'Graphite',
      quantity: 3,
    });

    await upsertCartItem({
      userId: 'user-1',
      productId: 101,
      productColorId: 201,
      colorName: 'Graphite',
      quantity: 3,
    });

    expect(mocks.cartItemDeleteMany).toHaveBeenCalledWith({
      where: { id: { in: [12] } },
    });
    expect(mocks.cartItemUpdate).toHaveBeenCalledWith({
      where: { id: 11 },
      data: {
        quantity: 3,
        productColorId: 201,
        colorName: 'Graphite',
      },
    });
  });
});
