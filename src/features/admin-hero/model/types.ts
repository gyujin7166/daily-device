export type AdminHeroType = {
  id: number;
  name: string;
};

export const getAdminHeroTypeLabel = (typeName: string) => {
  if (typeName === 'main') {
    return '메인 Hero';
  }

  if (typeName === 'product') {
    return '상품 카테고리 Hero';
  }

  if (typeName === 'product-all') {
    return '전체 상품 Hero';
  }

  if (typeName === 'product-discounts') {
    return '특가 상품 Hero';
  }

  return typeName;
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
};

export type HeroTone = 'light' | 'dark';
export type HeroOverlayTone = 'none' | 'dark' | 'light';
export type HeroPosition = 'start' | 'center' | 'end';

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
};

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
});
