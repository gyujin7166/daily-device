import { expect, test } from './fixtures/authenticatedTest';

import type { OrderPurchaseSummary } from '../src/entities/order/model/types';
import type { Page } from '@playwright/test';

const AUTHENTICATED_FLOW_TIMEOUT = 60_000;
const REMOTE_STATE_TIMEOUT = 15_000;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.gtag = (_command, event, parameters) => {
      if (event !== 'purchase') return;
      const events = JSON.parse(
        window.sessionStorage.getItem('playwright-purchases') ?? '[]',
      );
      events.push(parameters);
      window.sessionStorage.setItem(
        'playwright-purchases',
        JSON.stringify(events),
      );
    };
  });
  await page.route(/google-analytics\.com|googletagmanager\.com/, (route) =>
    route.abort(),
  );
});

const readPurchases = (page: Page) =>
  page.evaluate(() =>
    JSON.parse(window.sessionStorage.getItem('playwright-purchases') ?? '[]'),
  );

const expectedPurchase = (summary: OrderPurchaseSummary) => ({
  transaction_id: summary.orderNumber,
  currency: 'KRW',
  value: summary.totalAmount,
  items: summary.items.map((item) => ({
    item_id: String(item.productId),
    item_name: item.productName,
    ...(item.colorName ? { item_variant: item.colorName } : {}),
    price: item.price,
    quantity: item.quantity,
  })),
});

test('로그인 사용자가 장바구니 상품을 데모 결제하고 주문 내역을 확인한다', async ({
  authenticatedPage: page,
  e2eProduct,
  testAddress,
}) => {
  test.setTimeout(AUTHENTICATED_FLOW_TIMEOUT);

  await page.goto(
    `/products/${e2eProduct.categorySlug}/${e2eProduct.productSlug}`,
    { waitUntil: 'domcontentloaded' },
  );

  await expect(
    page.getByRole('button', {
      name: '사용자 메뉴 열기',
      exact: true,
    }),
  ).toBeEnabled();

  const productHeading = page.getByRole('heading', { level: 1 });
  await expect(productHeading).toBeVisible();
  const productName = (await productHeading.innerText()).trim();
  expect(productName).not.toBe('');

  const addToCartButton = page
    .getByRole('button')
    .filter({ hasText: '장바구니에 추가' });
  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();

  await expect(
    page.getByRole('heading', { name: '장바구니', exact: true }),
  ).toBeVisible();

  const checkoutButton = page.getByRole('button', {
    name: '결제하기',
    exact: true,
  });
  await expect(checkoutButton).toBeEnabled({
    timeout: REMOTE_STATE_TIMEOUT,
  });
  await checkoutButton.click();

  await expect(page).toHaveURL(/\/checkout$/, {
    timeout: REMOTE_STATE_TIMEOUT,
  });
  await expect(
    page.getByRole('heading', { name: '주문/결제', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '주문 상품 (1)', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: productName, exact: true }),
  ).toBeVisible();
  await expect(page.getByText('포트폴리오 데모 안내')).toBeVisible();
  await expect(
    page.getByText(testAddress.recipientName, { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(testAddress.address1, { exact: true }),
  ).toBeVisible();

  const demoPaymentMethod = page
    .getByRole('button')
    .filter({ hasText: '결제 승인 없이 주문을 확정하는 데모 흐름입니다.' });
  await expect(demoPaymentMethod).toBeVisible();
  await demoPaymentMethod.click();
  await expect(demoPaymentMethod).toHaveAttribute('aria-pressed', 'true');

  const demoPaymentButton = page.getByRole('button', {
    name: '데모 결제',
    exact: true,
  });
  await expect(demoPaymentButton).toBeEnabled();
  const orderResponsePromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/orders' &&
      response.request().method() === 'POST',
  );
  await demoPaymentButton.click();
  const createdOrder = (await (await orderResponsePromise).json()) as {
    items: OrderPurchaseSummary;
  };

  await expect(page).toHaveURL(/\/my\/orders$/, {
    timeout: REMOTE_STATE_TIMEOUT,
  });
  await expect(
    page.getByRole('heading', { name: '주문 목록', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('결제완료', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: productName, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(testAddress.recipientName, { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => readPurchases(page))
    .toEqual([expectedPurchase(createdOrder.items)]);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: '주문 목록', exact: true }),
  ).toBeVisible();
  expect(await readPurchases(page)).toEqual([
    expectedPurchase(createdOrder.items),
  ]);
});

test('Toss callback은 confirm 성공 후 한 번만 purchase를 보내고 재접근에도 중복하지 않는다', async ({
  authenticatedPage: page,
}) => {
  test.setTimeout(AUTHENTICATED_FLOW_TIMEOUT);
  const summary: OrderPurchaseSummary = {
    orderNumber: 'DD-playwright-toss',
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
  let requests = 0;
  let releaseConfirm!: () => void;
  const confirmReady = new Promise<void>((resolve) => {
    releaseConfirm = resolve;
  });
  await page.route('**/api/payments/toss/confirm', async (route) => {
    requests += 1;
    await confirmReady;
    await route.fulfill({
      json: { items: summary, message: 'Payment confirmed' },
    });
  });
  const callback = `/payments/toss/success?paymentKey=e2e-test-key&orderId=${summary.orderNumber}&amount=${summary.totalAmount}`;
  try {
    await page.goto(callback);
    await expect.poll(() => requests).toBe(1);
    expect(await readPurchases(page)).toEqual([]);
  } finally {
    releaseConfirm();
  }
  await expect(page).toHaveURL(/\/my\/orders$/, {
    timeout: REMOTE_STATE_TIMEOUT,
  });
  await expect
    .poll(() => readPurchases(page))
    .toEqual([expectedPurchase(summary)]);

  await page.goto(callback);
  await expect(page).toHaveURL(/\/my\/orders$/, {
    timeout: REMOTE_STATE_TIMEOUT,
  });
  expect(requests).toBe(2);
  expect(await readPurchases(page)).toEqual([expectedPurchase(summary)]);
});
