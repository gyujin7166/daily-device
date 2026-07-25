import { expect, test } from '@playwright/test';

test('홈 화면의 핵심 탐색 UI를 표시한다', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Daily Device/);
  await expect(
    page
      .getByRole('banner')
      .getByRole('link', { name: '홈으로 이동', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '상품 검색', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '장바구니 열기', exact: true }),
  ).toBeVisible();
});

test('홈에서 locale prefix를 중복하지 않고 언어를 전환한다', async ({
  page,
}) => {
  const failedImageRequests: string[] = [];

  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().includes('/_next/image')) {
      failedImageRequests.push(response.url());
    }
  });

  await page.goto('/');

  await page.getByRole('button', { name: '언어 변경', exact: true }).click();
  await page.getByRole('menuitem', { name: /English/ }).click();

  await expect.poll(() => new URL(page.url()).pathname).toBe('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    page.getByRole('button', { name: 'Change language', exact: true }),
  ).toContainText('en');

  await page
    .getByRole('button', { name: 'Change language', exact: true })
    .click();
  await page.getByRole('menuitem', { name: /한국어/ }).click();

  await expect.poll(() => new URL(page.url()).pathname).toBe('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  expect(failedImageRequests).toEqual([]);
});
