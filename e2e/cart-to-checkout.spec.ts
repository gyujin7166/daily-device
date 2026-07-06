import { expect, test } from '@playwright/test';

const PRODUCT_PATH = '/products/mice/aster-mouse-mini';
const STORAGE_INITIALIZED_KEY = 'playwright-storage-initialized';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: 'null',
    });
  });
  await page.addInitScript((storageInitializedKey) => {
    if (window.sessionStorage.getItem(storageInitializedKey)) {
      return;
    }

    window.localStorage.clear();
    window.sessionStorage.clear();
    window.sessionStorage.setItem(storageInitializedKey, 'true');
  }, STORAGE_INITIALIZED_KEY);
});

test('비회원이 장바구니에서 결제를 선택하면 로그인 화면으로 이동한다', async ({
  page,
}) => {
  await page.goto(PRODUCT_PATH);

  const productHeading = page.getByRole('heading', {
    name: 'Aster Mouse Mini',
    level: 1,
    exact: true,
  });
  await expect(productHeading).toBeVisible();
  await expect(
    page.getByRole('button', { name: '사용자 메뉴 열기', exact: true }),
  ).toBeEnabled();

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
  await expect(checkoutButton).toBeEnabled();
  await checkoutButton.click();

  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fcheckout$/);
  await expect(
    page.getByRole('heading', { name: '로그인', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: '데모 로그인' })).toBeVisible();
});
