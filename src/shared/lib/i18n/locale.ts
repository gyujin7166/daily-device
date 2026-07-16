import { routing } from '@shared/config/i18n/routing';
import type { Locale } from '@shared/config/i18n/routing';

export const DEFAULT_LOCALE = routing.defaultLocale;

export const isSupportedLocale = (
  value: string | null | undefined,
): value is Locale =>
  typeof value === 'string' && routing.locales.includes(value as Locale);

export const toSupportedLocale = (value: string | null | undefined): Locale =>
  isSupportedLocale(value) ? value : DEFAULT_LOCALE;

export const getLocaleFallbacks = (locale: Locale): Locale[] =>
  Array.from(new Set([locale, DEFAULT_LOCALE]));
