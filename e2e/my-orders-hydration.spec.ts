import enMessages from '../messages/en.json';
import koMessages from '../messages/ko.json';
import { routing } from '../src/shared/config/i18n/routing';

import { expect, test } from './fixtures/authenticatedTest';

const screens = [
  { href: '/my/orders', key: 'all' },
  { href: '/my/reviews', key: 'reviewWritten' },
  { href: '/my/reviews/write', key: 'reviewWrite' },
] as const;

test.beforeEach(async ({ context }) => {
  await context.route(
    /https:\/\/[^/]*(google-analytics\.com|googletagmanager\.com|toss\.im)/,
    (route) => route.abort(),
  );
});

for (const locale of routing.locales) {
  const messages = { ko: koMessages, en: enMessages }[locale].MyOrders;
  const path = (href: string) =>
    locale === routing.defaultLocale ? href : `/${locale}${href}`;

  for (const screen of screens) {
    test(`${locale} ${screen.href} 서버 HTML과 JS 로딩 후 빈 화면이 일치한다`, async ({
      authenticatedPage: page,
    }) => {
      test.setTimeout(90_000);
      const hydrationErrors: string[] = [];
      page.on('pageerror', (error) => hydrationErrors.push(error.message));
      page.on('console', (message) => {
        if (
          message.type() === 'error' &&
          /hydration|didn.t match/i.test(message.text())
        ) {
          hydrationErrors.push(message.text());
        }
      });

      let releaseScripts!: () => void;
      const scriptsReady = new Promise<void>((resolve) => {
        releaseScripts = resolve;
      });
      let blockedScripts = 0;
      await page.route('**/_next/static/**', async (route) => {
        if (route.request().resourceType() === 'script') {
          blockedScripts += 1;
          await scriptsReady;
        }
        await route.continue();
      });

      let serverHasDescription = false;
      let serverHasEmptyState = false;
      try {
        const response = await page.goto(path(screen.href), {
          waitUntil: 'commit',
        });
        expect(response?.status()).toBe(200);
        // The full HTML/RSC stream (including any pending query) arrives before JS.
        await response!.finished();
        await expect.poll(() => blockedScripts).toBeGreaterThan(0);
        await expect(
          page.getByRole('heading', {
            level: 1,
            name: messages.meta[screen.key].title,
            exact: true,
          }),
        ).toBeVisible();
        serverHasDescription = await page
          .getByText(messages.meta[screen.key].description, { exact: true })
          .isVisible();
        serverHasEmptyState = await page
          .getByRole('heading', {
            name: messages.empty[screen.key].title,
            exact: true,
          })
          .isVisible();
      } finally {
        releaseScripts();
      }

      await page.waitForLoadState('load');
      await expect(
        page.getByText(messages.meta[screen.key].description, { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', {
          name: messages.empty[screen.key].title,
          exact: true,
        }),
      ).toBeVisible();
      // Trigger selective hydration on the actual content before checking errors.
      await page
        .getByRole('heading', {
          level: 1,
          name: messages.meta[screen.key].title,
          exact: true,
        })
        .click();
      expect(hydrationErrors).toEqual([]);
      expect(serverHasDescription).toBe(true);
      expect(serverHasEmptyState).toBe(true);
    });
  }

  test(`${locale} 주문·상품평 화면의 비회원 로그인 redirect를 유지한다`, async ({
    page,
  }) => {
    test.setTimeout(60_000);
    for (const screen of screens) {
      await page.goto(path(screen.href));
      await expect(page).toHaveURL(/\/login\?/);
      expect(new URL(page.url()).searchParams.get('callbackUrl')).toContain(
        screen.href,
      );
    }
  });
}
