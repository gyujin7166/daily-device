import type { Metadata } from 'next';

import { routing } from '@shared/config/i18n/routing';
import type { Locale } from '@shared/config/i18n/routing';
import { SITE_ORIGIN } from '@shared/config/site';
import { getPathname } from '@shared/lib/i18n/navigation';

export function getPageAlternates(
  locale: Locale,
  pathname: string,
): NonNullable<Metadata['alternates']> {
  const getUrl = (targetLocale: Locale) =>
    new URL(
      getPathname({ locale: targetLocale, href: pathname }),
      SITE_ORIGIN,
    ).toString();

  return {
    canonical: getUrl(locale),
    languages: Object.fromEntries(
      routing.locales.map((language) => [language, getUrl(language)]),
    ),
  };
}
