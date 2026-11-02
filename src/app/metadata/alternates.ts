import type { Metadata } from 'next';

import { routing } from '@shared/config/i18n/routing';
import type { Locale } from '@shared/config/i18n/routing';
import { getLocalizedPageUrl } from '@shared/lib/seo/getLocalizedPageUrl';

export function getPageAlternates(
  locale: Locale,
  pathname: string,
): NonNullable<Metadata['alternates']> {
  return {
    canonical: getLocalizedPageUrl(locale, pathname),
    languages: Object.fromEntries(
      routing.locales.map((language) => [
        language,
        getLocalizedPageUrl(language, pathname),
      ]),
    ),
  };
}
