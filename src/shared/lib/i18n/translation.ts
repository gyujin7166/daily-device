import {
  DEFAULT_LOCALE,
  getLocaleFallbacks,
  toSupportedLocale,
} from './locale';

export type LocaleTranslation = {
  locale: string;
};

export const getTranslationContext = (localeValue?: string | null) => {
  const locale = toSupportedLocale(localeValue);

  return {
    locale,
    localeFallbacks: getLocaleFallbacks(locale),
  };
};

export const pickTranslation = <T extends LocaleTranslation>(
  translations: T[],
  locale: string,
) =>
  translations.find((translation) => translation.locale === locale) ??
  translations.find((translation) => translation.locale === DEFAULT_LOCALE);
