import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import createMiddleware from 'next-intl/middleware';

import { routing } from './src/i18n/routing';

const handleI18nRouting = createMiddleware(routing);

const hasLocalePrefix = (pathname: string) =>
  routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

const getPreferredLanguage = (acceptLanguage: string | null) => {
  if (!acceptLanguage) {
    return undefined;
  }

  const languages = acceptLanguage
    .split(',')
    .map((item, index) => {
      const [language, ...params] = item.trim().split(';');
      const qValue = params
        .map((param) => param.trim())
        .find((param) => param.startsWith('q='))
        ?.slice(2);

      return {
        language: language.toLowerCase(),
        order: index,
        quality: qValue ? Number(qValue) : 1,
      };
    })
    .filter(({ language, quality }) => language && Number.isFinite(quality))
    .sort(
      (left, right) => right.quality - left.quality || left.order - right.order,
    );

  return languages[0]?.language;
};

const shouldRedirectToEnglishByBrowserLanguage = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const savedLocale = request.cookies.get('NEXT_LOCALE')?.value;

  if (savedLocale || hasLocalePrefix(pathname)) {
    return false;
  }

  const preferredLanguage = getPreferredLanguage(
    request.headers.get('accept-language'),
  );

  return Boolean(preferredLanguage && !preferredLanguage.startsWith('ko'));
};

export default function proxy(request: NextRequest) {
  if (shouldRedirectToEnglishByBrowserLanguage(request)) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${url.pathname === '/' ? '' : url.pathname}`;

    return NextResponse.redirect(url);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
