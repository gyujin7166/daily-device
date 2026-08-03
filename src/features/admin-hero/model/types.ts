const ADMIN_HERO_TYPE_LABEL_KEYS = {
  main: 'types.main',
  product: 'types.product',
  'product-all': 'types.product-all',
  'product-discounts': 'types.product-discounts',
} as const;

export const getAdminHeroTypeLabelKey = (name: string) =>
  ADMIN_HERO_TYPE_LABEL_KEYS[name as keyof typeof ADMIN_HERO_TYPE_LABEL_KEYS];

export type AdminHeroType = {
  id: number;
  name: string;
};

export type AdminHeroCategory = {
  id: number;
  name_en: string;
  name_ko: string;
  slug: string;
};

export type AdminHero = {
  id: number;
  name_en: string;
  name_ko: string;
  image_url: string | null;
  image_width: number | null;
  image_height: number | null;
  description: string | null;
  detailed_description: string | null;
  position: string | null;
  isDefault: boolean;
  textTone: HeroTone;
  navTone: HeroTone;
  overlayTone: HeroOverlayTone;
  heroTypeId: number;
  heroType: AdminHeroType;
  targetCategoryId: number | null;
  targetCategory: AdminHeroCategory | null;
  translations: HeroTranslation[];
};

export type HeroTone = 'light' | 'dark';
export type HeroOverlayTone = 'none' | 'dark' | 'light';
export type HeroPosition = 'start' | 'center' | 'end';
export type HeroTranslationLocale = 'ko' | 'en';

export type HeroTranslation = {
  locale: HeroTranslationLocale;
  name: string;
  description: string | null;
  detailed_description: string | null;
};

export type HeroTranslationFormState = {
  name: string;
  description: string;
  detailed_description: string;
};

export type HeroTranslationFormMap = Record<
  HeroTranslationLocale,
  HeroTranslationFormState
>;

export type AdminHeroPayload = {
  heroTypes: AdminHeroType[];
  categories: AdminHeroCategory[];
  heroes: AdminHero[];
};

export type HeroFormState = {
  id: number | null;
  name_en: string;
  name_ko: string;
  heroTypeId: string;
  targetCategoryId: string;
  image_url: string;
  image_width: string;
  image_height: string;
  description: string;
  detailed_description: string;
  position: HeroPosition;
  isDefault: boolean;
  textTone: HeroTone;
  navTone: HeroTone;
  overlayTone: HeroOverlayTone;
  translations: HeroTranslationFormMap;
};

const createEmptyTranslations = (): HeroTranslationFormMap => ({
  ko: {
    name: '',
    description: '',
    detailed_description: '',
  },
  en: {
    name: '',
    description: '',
    detailed_description: '',
  },
});

export const emptyHeroForm: HeroFormState = {
  id: null,
  name_en: '',
  name_ko: '',
  heroTypeId: '',
  targetCategoryId: '',
  image_url: '',
  image_width: '',
  image_height: '',
  description: '',
  detailed_description: '',
  position: 'center',
  isDefault: false,
  textTone: 'light',
  navTone: 'light',
  overlayTone: 'none',
  translations: createEmptyTranslations(),
};

const getHeroTranslationForm = (
  hero: AdminHero,
  locale: HeroTranslationLocale,
): HeroTranslationFormState => {
  const translation = hero.translations.find((item) => item.locale === locale);

  if (translation) {
    return {
      name: translation.name,
      description: translation.description ?? '',
      detailed_description: translation.detailed_description ?? '',
    };
  }

  return {
    name: locale === 'en' ? hero.name_en : hero.name_ko,
    description: hero.description ?? '',
    detailed_description: hero.detailed_description ?? '',
  };
};

export const createHeroFormFromItem = (hero: AdminHero): HeroFormState => ({
  id: hero.id,
  name_en: hero.name_en,
  name_ko: hero.name_ko,
  heroTypeId: String(hero.heroTypeId),
  targetCategoryId: hero.targetCategoryId ? String(hero.targetCategoryId) : '',
  image_url: hero.image_url ?? '',
  image_width: hero.image_width ? String(hero.image_width) : '',
  image_height: hero.image_height ? String(hero.image_height) : '',
  description: hero.description ?? '',
  detailed_description: hero.detailed_description ?? '',
  position:
    hero.position === 'start' || hero.position === 'center'
      ? hero.position
      : hero.position === 'end'
        ? hero.position
        : 'center',
  isDefault: hero.isDefault,
  textTone: hero.textTone,
  navTone: hero.navTone,
  overlayTone: hero.overlayTone,
  translations: {
    ko: getHeroTranslationForm(hero, 'ko'),
    en: getHeroTranslationForm(hero, 'en'),
  },
});
