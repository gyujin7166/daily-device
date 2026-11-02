import { SITE_ORIGIN } from '../../config/site';
import { getPathname } from '../i18n/navigation';

import type { Locale } from '../../config/i18n/routing';

export function getLocalizedPageUrl(locale: Locale, pathname: string): string {
  return new URL(
    getPathname({ locale, href: pathname }),
    SITE_ORIGIN,
  ).toString();
}
