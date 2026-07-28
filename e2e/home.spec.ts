import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

type ThemeTransitionState = {
  dataTheme: string | null;
  isDark: boolean;
};

type ThemeTransitionWindow = Window & {
  __themeColorTransitions?: string[];
  __themeTransitionActive?: boolean;
  __themeTransitionStates?: ThemeTransitionState[];
};

const startThemeTransitionRecording = async (page: Page) => {
  await page.evaluate(() => {
    const transitionWindow = window as ThemeTransitionWindow;
    transitionWindow.__themeColorTransitions = [];
    transitionWindow.__themeTransitionStates = [];
    transitionWindow.__themeTransitionActive = true;
    document.addEventListener(
      'transitionstart',
      (event) => {
        if (
          document.documentElement.classList.contains(
            'theme-locale-switching',
          ) &&
          (event.propertyName === 'background-color' ||
            event.propertyName === 'border-color')
        ) {
          transitionWindow.__themeColorTransitions?.push(event.propertyName);
        }
      },
      { capture: true, once: false },
    );

    const recordThemeState = () => {
      const root = document.documentElement;
      transitionWindow.__themeTransitionStates?.push({
        dataTheme: root.getAttribute('data-theme'),
        isDark: root.classList.contains('dark'),
      });

      if (transitionWindow.__themeTransitionActive) {
        window.requestAnimationFrame(recordThemeState);
      }
    };

    recordThemeState();
  });
};

const stopThemeTransitionRecording = async (page: Page) =>
  page.evaluate(() => {
    const transitionWindow = window as ThemeTransitionWindow;
    transitionWindow.__themeTransitionActive = false;
    return {
      colorTransitions: transitionWindow.__themeColorTransitions ?? [],
      themeStates: transitionWindow.__themeTransitionStates ?? [],
    };
  });

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
  const scriptRenderingErrors: string[] = [];

  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().includes('/_next/image')) {
      failedImageRequests.push(response.url());
    }
  });
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      message
        .text()
        .includes('Encountered a script tag while rendering React component')
    ) {
      scriptRenderingErrors.push(message.text());
    }
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('theme', 'dark');
  });

  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.getByRole('button', { name: '언어 변경', exact: true }).click();
  await page.getByRole('menuitem', { name: /English/ }).click();

  await expect.poll(() => new URL(page.url()).pathname).toBe('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(
    page.getByRole('button', { name: 'Change language', exact: true }),
  ).toContainText('en');

  await page
    .getByRole('button', { name: 'Change language', exact: true })
    .click();
  await page.getByRole('menuitem', { name: /한국어/ }).click();

  await expect.poll(() => new URL(page.url()).pathname).toBe('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveClass(/dark/);
  expect(failedImageRequests).toEqual([]);
  expect(scriptRenderingErrors).toEqual([]);
});

test('홈·상품·검색에서 locale 전환 중에도 다크 테마를 유지한다', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => {
    window.localStorage.setItem('theme', 'dark');
  });
  const cases = [
    { name: '홈', href: '/', expectedHref: '/en' },
    {
      name: '상품 목록',
      href: '/products',
      expectedHref: '/en/products',
    },
    {
      name: '상품 카테고리',
      href: '/products/mice',
      expectedHref: '/en/products/mice',
    },
    {
      name: '상품 검색',
      href: '/search?query=as',
      expectedHref: '/en/search?query=as',
    },
  ];

  for (const routeCase of cases) {
    await test.step(routeCase.name, async () => {
      await page.context().clearCookies();
      await page.goto(routeCase.href);

      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await expect(page.locator('html')).toHaveClass(/dark/);
      await startThemeTransitionRecording(page);

      await page
        .getByRole('button', { name: '언어 변경', exact: true })
        .click();
      await page.getByRole('menuitem', { name: /English/ }).click();

      await expect
        .poll(() => {
          const url = new URL(page.url());
          return `${url.pathname}${url.search}`;
        })
        .toBe(routeCase.expectedHref);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await page.waitForTimeout(100);

      const { colorTransitions, themeStates } =
        await stopThemeTransitionRecording(page);

      expect(themeStates.length).toBeGreaterThan(0);
      expect(themeStates.every((state) => state.dataTheme === 'dark')).toBe(
        true,
      );
      expect(themeStates.every((state) => state.isDark)).toBe(true);
      expect(colorTransitions).toEqual([]);
    });
  }
});
