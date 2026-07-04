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
