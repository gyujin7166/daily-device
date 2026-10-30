import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { confirmTossPaymentForUser } from './service';

const mocks = vi.hoisted(() => ({
  findOrder: vi.fn(),
  transaction: vi.fn(),
  updateOrder: vi.fn(),
  upsertPayment: vi.fn(),
  findCart: vi.fn(),
  deleteCartItems: vi.fn(),
  expire: vi.fn(),
}));
vi.mock('server-only', () => ({}));
vi.mock('@app/api-routes/orders/expirePendingOrders', () => ({
  expirePendingOrders: mocks.expire,
}));
vi.mock('prisma/prismaClientSingleton', () => ({
  default: {
    order: { findFirst: mocks.findOrder },
    $transaction: mocks.transaction,
  },
}));

const params = {
  userId: 'user-1',
  paymentKey: 'test-payment-key',
  orderId: 'DD-server',
  amountValue: 160_000,
  secretKey: 'test-only-secret',
};
const order = {
  id: 301,
  userId: 'user-1',
  orderNumber: 'DD-server',
  status: 'PENDING',
  isBuyNow: false,
  orderItems: [
    {
      productId: 101,
      productColorId: 201,
      productName: 'DB Mouse',
      colorName: 'Black',
      price: 80_000,
      quantity: 2,
    },
  ],
  payment: null,
};
const summary = {
  orderNumber: 'DD-server',
  status: 'CONFIRMED',
  totalAmount: 160_000,
  items: [
    {
      productId: 101,
      productName: 'DB Mouse',
      colorName: 'Black',
      price: 80_000,
      quantity: 2,
    },
  ],
};

describe('Toss confirm purchase summary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findOrder.mockResolvedValue(order);
    mocks.findCart.mockResolvedValue({ id: 10 });
    mocks.transaction.mockImplementation(
      async (callback: (tx: unknown) => unknown) =>
        callback({
          order: { update: mocks.updateOrder },
          orderPayment: { upsert: mocks.upsertPayment },
          cart: { findFirst: mocks.findCart },
          cartItem: { deleteMany: mocks.deleteCartItems },
        }),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          paymentKey: 'private-payment-key',
          totalAmount: 160_000,
          status: 'DONE',
          customerName: 'Private Customer',
        }),
      ),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('Toss 승인과 DB 확정 후 raw payload 없이 비식별 요약을 반환한다', async () => {
    const result = await confirmTossPaymentForUser(params);
    expect(result).toEqual({
      status: 200,
      body: { items: summary, message: 'Payment confirmed' },
    });
    expect(mocks.updateOrder).toHaveBeenCalledWith({
      where: { id: 301 },
      data: { status: 'CONFIRMED' },
    });
    expect(mocks.upsertPayment).toHaveBeenCalledOnce();
    expect(mocks.deleteCartItems).toHaveBeenCalledWith({
      where: { cartId: 10, OR: [{ productId: 101, productColorId: 201 }] },
    });
  });

  it('이미 확정된 주문도 같은 요약을 반환하고 외부 승인을 반복하지 않는다', async () => {
    mocks.findOrder.mockResolvedValue({ ...order, status: 'CONFIRMED' });
    const result = await confirmTossPaymentForUser(params);
    expect(result).toEqual({
      status: 200,
      body: { items: summary, message: 'Order already confirmed' },
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('amount 불일치는 승인 전에 실패한다', async () => {
    await expect(
      confirmTossPaymentForUser({ ...params, amountValue: 1 }),
    ).rejects.toThrow('Amount mismatch');
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('다른 사용자의 주문은 승인 전에 거부한다', async () => {
    await expect(
      confirmTossPaymentForUser({ ...params, userId: 'other-user' }),
    ).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('Toss upstream 실패는 주문을 확정하지 않는다', async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json({ message: 'Rejected' }, { status: 400 }),
    );
    const result = await confirmTossPaymentForUser(params);
    expect(result.status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(result.body.items).not.toHaveProperty('orderNumber');
  });

  it('DB transaction 실패는 성공 요약을 반환하지 않는다', async () => {
    mocks.transaction.mockRejectedValue(new Error('DB failed'));
    await expect(confirmTossPaymentForUser(params)).rejects.toThrow(
      'DB failed',
    );
  });

  it('buyNow는 확정 후 장바구니를 정리하지 않는다', async () => {
    mocks.findOrder.mockResolvedValue({ ...order, isBuyNow: true });
    const result = await confirmTossPaymentForUser(params);
    expect(result.body.items).toEqual(summary);
    expect(mocks.findCart).not.toHaveBeenCalled();
    expect(mocks.deleteCartItems).not.toHaveBeenCalled();
  });
});
