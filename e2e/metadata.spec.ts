import enMessages from '../messages/en.json';
import koMessages from '../messages/ko.json';
import prisma from '../prisma/prismaClientSingleton';
import { routing } from '../src/shared/config/i18n/routing';

import { expect, test } from './fixtures/productTest';

test.beforeEach(async ({ context }) => {
  // Metadata tests must not send analytics or contact a real payment provider.
  await context.route(
    /https:\/\/[^/]*(google-analytics\.com|googletagmanager\.com|toss\.im)/,
    (route) => route.abort(),
  );
});

for (const locale of routing.locales) {
  const messages = locale === routing.defaultLocale ? koMessages : enMessages;
  const path = (href: string) =>
    locale === routing.defaultLocale
      ? href
      : `/${locale}${href === '/' ? '' : href}`;

  test(`${locale} 공개 페이지와 검색·로그인에 고유 HTML title을 표시한다`, async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const cases = [
      {
        href: '/',
        title: 'Daily Device',
        description: messages.Metadata.homeDescription,
      },
      { href: '/products', ...messages.Products.allHero.all },
      { href: '/products/discounts', ...messages.Products.allHero.discounts },
      { href: '/terms', ...messages.Policy.terms },
      { href: '/privacy', ...messages.Policy.privacy },
      { href: '/cookies', ...messages.Policy.cookies },
      {
        href: '/search?query=private-email%40example.test',
        title: messages.Metadata.search,
        noindex: true,
      },
      { href: '/login', title: messages.Metadata.login, noindex: true },
    ];

    for (const routeCase of cases) {
      await test.step(routeCase.href, async () => {
        await page.goto(path(routeCase.href));
        await expect(page).toHaveTitle(
          routeCase.href === '/'
            ? 'Daily Device'
            : `${routeCase.title} | Daily Device`,
        );
        if ('description' in routeCase && routeCase.description) {
          await expect(
            page.locator('meta[name="description"]'),
          ).toHaveAttribute('content', routeCase.description);
        }
        if ('noindex' in routeCase) {
          await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
            'content',
            'noindex, nofollow',
          );
        } else {
          await expect(
            page.locator('meta[name="robots"][content*="noindex"]'),
          ).toHaveCount(0);
        }
      });
    }
  });

  test(`${locale} DB 번역명과 상품 설명을 metadata에 사용하고 잘못된 상품은 404 처리한다`, async ({
    page,
    e2eProduct,
  }) => {
    test.setTimeout(120_000);
    const product = await prisma.product.findUniqueOrThrow({
      where: { slug: e2eProduct.productSlug },
      include: {
        translations: true,
        category: { include: { translations: true } },
      },
    });
    const categoryName = product.category.translations.find(
      (translation) => translation.locale === locale,
    )!.name;
    const translation = product.translations.find(
      (translation) => translation.locale === locale,
    )!;
    const categoryHref = path(`/products/${e2eProduct.categorySlug}`);
    const productHref = path(
      `/products/${e2eProduct.categorySlug}/${e2eProduct.productSlug}`,
    );

    await page.goto(categoryHref);
    await expect(page).toHaveTitle(`${categoryName} | Daily Device`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      new RegExp(categoryName),
    );
    await expect(
      page.locator('meta[name="robots"][content*="noindex"]'),
    ).toHaveCount(0);

    // Check crawler-facing metadata on a direct product load.
    await page.goto(productHref);
    await expect(page).toHaveTitle(`${translation.name} | Daily Device`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      translation.description,
    );
    await expect(
      page.locator('meta[name="robots"][content*="noindex"]'),
    ).toHaveCount(0);

    // Also verify document.title updates during client navigation to another product.
    await page.locator(`a[href="${categoryHref}"]`).first().click();
    await expect(page).toHaveTitle(`${categoryName} | Daily Device`);
    const nextProductLink = page
      .locator(`a[href^="${categoryHref}/"]:not([href="${productHref}"])`)
      .first();
    const nextHref = await nextProductLink.getAttribute('href');
    expect(nextHref).toBeTruthy();
    const nextProduct = await prisma.product.findUniqueOrThrow({
      where: { slug: decodeURIComponent(nextHref!.split('/').at(-1)!) },
      select: { translations: { where: { locale }, select: { name: true } } },
    });
    await nextProductLink.click();
    await expect(page).toHaveTitle(
      `${nextProduct.translations[0].name} | Daily Device`,
    );

    for (const href of [
      `/products/${e2eProduct.categorySlug}/missing-metadata-product`,
      `/products/wrong-metadata-category/${e2eProduct.productSlug}`,
    ]) {
      const response = await page.goto(path(href));
      expect(response?.status()).toBe(404);
      await expect(page).not.toHaveTitle(`${translation.name} | Daily Device`);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        /noindex/,
      );
    }
  });

  test(`${locale} 인증 화면 제목에 사용자별 값을 넣지 않고 비공개 영역을 noindex 처리한다`, async ({
    context,
    page,
  }) => {
    test.setTimeout(180_000);
    const login = await context.request.post('/api/auth/demo-login', {
      data: { callbackUrl: '/' },
    });
    expect(login).toBeOK();

    const cases = [
      ['/checkout', messages.Metadata.checkout],
      ['/payments/toss/success', messages.Metadata.paymentSuccess],
      ['/payments/toss/fail', messages.Metadata.paymentFail],
      ['/my', messages.Metadata.my],
      ['/my/orders', messages.Metadata.orders],
      ['/my/orders/private-order-123', messages.Metadata.orderDetail],
      ['/my/wishlist', messages.Metadata.wishlist],
      ['/my/address', messages.Metadata.address],
      ['/my/reviews', messages.Metadata.reviews],
      ['/my/reviews/write', messages.Metadata.reviewWrite],
      ['/admin', messages.Metadata.admin],
    ];

    for (const [href, title] of cases) {
      await test.step(href, async () => {
        await page.goto(path(href));
        await expect(page).toHaveTitle(`${title} | Daily Device`);
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
          'content',
          'noindex, nofollow',
        );
      });
    }
  });

  test(`${locale} 인증이 필요한 페이지의 기존 로그인 redirect를 유지한다`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    for (const href of ['/checkout', '/my/orders', '/admin']) {
      await page.goto(path(href));
      await expect(page).toHaveURL(/\/login\?/);
      await expect(page).toHaveTitle(
        `${messages.Metadata.login} | Daily Device`,
      );
    }
  });
}
