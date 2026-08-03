import { expect, test } from './fixtures/productTest';

const capturesHydrationError = (message: string) =>
  message.toLowerCase().includes('hydration failed');

test('상품 카테고리를 새로고침해도 서버와 클라이언트 상품 수가 일치한다', async ({
  e2eProduct,
  page,
}) => {
  const hydrationErrors: string[] = [];
  const captureHydrationError = (message: string) => {
    if (capturesHydrationError(message)) {
      hydrationErrors.push(message);
    }
  };

  page.on('console', (message) => {
    if (message.type() === 'error') {
      captureHydrationError(message.text());
    }
  });
  page.on('pageerror', (error) => captureHydrationError(error.message));

  const productCount = page.locator('p').filter({ hasText: /^총 \d+개 상품$/ });

  await page.goto(`/products/${e2eProduct.categorySlug}`);
  await expect(productCount).toBeVisible();

  await page.reload();
  await expect(productCount).toBeVisible();

  expect(hydrationErrors).toEqual([]);
});
