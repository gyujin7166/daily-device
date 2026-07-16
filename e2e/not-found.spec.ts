import { expect, test } from '@playwright/test';

const hydrationErrorFragments = [
  '<html> cannot be a child of <body>',
  '<body> cannot contain a nested <html>',
  'mounting a new html component',
  'mounting a new body component',
  'hydration failed',
];

const localeCases = [
  {
    locale: 'ko',
    invalidPath: '/missing-page',
    title: '페이지를 찾을 수 없습니다.',
    homeLabel: '← 홈으로 돌아가기',
    homeHref: '/ko',
    canonicalHomePath: '/',
  },
  {
    locale: 'en',
    invalidPath: '/en/missing-page',
    title: 'Page not found.',
    homeLabel: '← Back to home',
    homeHref: '/en',
    canonicalHomePath: '/en',
  },
] as const;

for (const localeCase of localeCases) {
  test(`${localeCase.locale} 글로벌 404에서 홈으로 안전하게 이동한다`, async ({
    page,
  }) => {
    const hydrationErrors: string[] = [];
    const captureHydrationError = (message: string) => {
      const normalizedMessage = message.toLowerCase();

      if (
        hydrationErrorFragments.some((fragment) =>
          normalizedMessage.includes(fragment),
        )
      ) {
        hydrationErrors.push(message);
      }
    };

    page.on('console', (message) => {
      if (message.type() === 'error') {
        captureHydrationError(message.text());
      }
    });
    page.on('pageerror', (error) => captureHydrationError(error.message));

    const response = await page.goto(localeCase.invalidPath);

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: localeCase.title, exact: true }),
    ).toBeVisible();

    const homeLink = page.getByRole('link', {
      name: localeCase.homeLabel,
      exact: true,
    });
    await expect(homeLink).toHaveAttribute('href', localeCase.homeHref);

    await page.evaluate(() => {
      Reflect.set(window, '__notFoundDocumentMarker', true);
    });
    await homeLink.click();

    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe(localeCase.canonicalHomePath);
    await expect(page.locator('html')).toHaveAttribute(
      'lang',
      localeCase.locale,
    );
    await expect(page.locator('[data-not-found-page]')).toHaveCount(0);
    await expect(page.locator('html')).toHaveCount(1);
    await expect(page.locator('body')).toHaveCount(1);

    const documentMarker = await page.evaluate(() =>
      Reflect.get(window, '__notFoundDocumentMarker'),
    );

    expect(documentMarker).toBeUndefined();
    expect(hydrationErrors).toEqual([]);
  });
}
