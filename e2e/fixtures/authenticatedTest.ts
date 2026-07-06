import { expect, test as base } from '@playwright/test';

import prisma from '../../prisma/prismaClientSingleton';

import type { APIRequestContext, Page } from '@playwright/test';

type TestAddress = {
  id: number;
  recipientName: string;
  recipientPhone: string;
  address1: string;
  address2: string;
};

type AuthenticatedFixtures = {
  authenticatedPage: Page;
  testAddress: TestAddress;
};

type CartApiResponse = {
  items: {
    items: Array<{ id: number }>;
  };
};

type AddressApiResponse = {
  items: {
    id: number;
  };
};

const STORAGE_INITIALIZED_KEY = 'playwright-storage-initialized';
const TEST_USER_EMAIL = 'playwright@daily-device.local';
const TEST_ADDRESS = {
  recipientName: 'Playwright Recipient',
  recipientPhone: '01012345678',
  address1: '서울특별시 테스트구 테스트로 100',
  address2: '101호',
} as const;

async function clearOrders() {
  const user = await prisma.user.findUnique({
    where: { email: TEST_USER_EMAIL },
    select: { id: true },
  });

  if (!user) {
    return;
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    select: { id: true },
  });
  const orderIds = orders.map((order) => order.id);

  if (orderIds.length === 0) {
    return;
  }

  const orderItems = await prisma.orderItem.findMany({
    where: { orderId: { in: orderIds } },
    select: { id: true },
  });
  const orderItemIds = orderItems.map((item) => item.id);

  await prisma.$transaction([
    prisma.productReview.deleteMany({
      where: { orderItemId: { in: orderItemIds } },
    }),
    prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } }),
    prisma.orderPayment.deleteMany({ where: { orderId: { in: orderIds } } }),
    prisma.orderShipping.deleteMany({ where: { orderId: { in: orderIds } } }),
    prisma.order.deleteMany({ where: { id: { in: orderIds } } }),
  ]);
}

async function clearCart(request: APIRequestContext) {
  const cartResponse = await request.get('/api/cart');
  expect(cartResponse).toBeOK();

  const cart = (await cartResponse.json()) as CartApiResponse;
  for (const item of cart.items.items) {
    const deleteResponse = await request.delete('/api/cart', {
      data: { cartItemId: item.id },
    });
    expect(deleteResponse).toBeOK();
  }
}

async function signOut(request: APIRequestContext) {
  const csrfResponse = await request.get('/api/auth/csrf');
  expect(csrfResponse).toBeOK();

  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };
  const signOutResponse = await request.post('/api/auth/signout', {
    form: {
      csrfToken,
      callbackUrl: '/',
    },
  });
  expect(signOutResponse).toBeOK();
}

export const test = base.extend<AuthenticatedFixtures>({
  authenticatedPage: async ({ context, page }, provide) => {
    await page.addInitScript((storageInitializedKey) => {
      if (window.sessionStorage.getItem(storageInitializedKey)) {
        return;
      }

      window.localStorage.clear();
      window.sessionStorage.clear();
      window.sessionStorage.setItem(storageInitializedKey, 'true');
    }, STORAGE_INITIALIZED_KEY);

    const loginResponse = await context.request.post('/api/auth/demo-login', {
      data: { callbackUrl: '/products' },
    });
    expect(loginResponse).toBeOK();
    await clearOrders();
    await clearCart(context.request);

    try {
      await provide(page);
    } finally {
      await clearCart(context.request);
      await clearOrders();
      await signOut(context.request);
    }
  },
  testAddress: async ({ authenticatedPage, context }, provide) => {
    void authenticatedPage;

    const createResponse = await context.request.post('/api/addresses', {
      data: {
        ...TEST_ADDRESS,
        isDefault: true,
      },
    });
    expect(createResponse).toBeOK();

    const responseBody = (await createResponse.json()) as AddressApiResponse;
    const testAddress = {
      id: responseBody.items.id,
      ...TEST_ADDRESS,
    };

    try {
      await provide(testAddress);
    } finally {
      const deleteResponse = await context.request.delete(
        `/api/addresses/${testAddress.id}`,
      );
      expect(deleteResponse).toBeOK();
    }
  },
});

export { expect };
