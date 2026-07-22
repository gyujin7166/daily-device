import { expect, test } from './fixtures/authenticatedTest';

const PRODUCT_PATH = '/products/mice/aster-mouse-mini';
const AUTHENTICATED_FLOW_TIMEOUT = 60_000;
const REMOTE_STATE_TIMEOUT = 15_000;

test('로그인 사용자가 장바구니 상품을 데모 결제하고 주문 내역을 확인한다', async ({
  authenticatedPage: page,
  testAddress,
}) => {
  test.setTimeout(AUTHENTICATED_FLOW_TIMEOUT);

  await page.goto(PRODUCT_PATH);

  await expect(
    page.getByRole('button', {
      name: '사용자 메뉴 열기',
      exact: true,
    }),
  ).toBeEnabled();

  await expect(
    page.getByRole('heading', {
      name: 'Aster Mouse Mini',
      level: 1,
      exact: true,
    }),
  ).toBeVisible();

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
    page.getByRole('link', { name: 'Aster Mouse Mini', exact: true }),
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
  await demoPaymentButton.click();

  await expect(page).toHaveURL(/\/my\/orders$/, {
    timeout: REMOTE_STATE_TIMEOUT,
  });
  await expect(
    page.getByRole('heading', { name: '주문 목록', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('결제완료', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Aster Mouse Mini', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(testAddress.recipientName, { exact: true }),
  ).toBeVisible();
});
