export const PRODUCT_ALL_HERO_MIN_HEIGHT_CLASS_NAME =
  'min-h-[44vh] supports-[height:100svh]:min-h-[44svh] sm:min-h-[46vh] sm:supports-[height:100svh]:min-h-[46svh] md:min-h-[48vh] md:supports-[height:100svh]:min-h-[48svh] lg:min-h-[50vh]';

export const PRODUCT_ALL_HERO_VIEWPORT_OFFSET_TOP_PX = 90;

export type ProductAllHeroContent = {
  eyebrow: string;
  title: string;
  description: string;
};

export const PRODUCT_ALL_HERO_CONTENT: ProductAllHeroContent = {
  eyebrow: 'Products',
  title: 'All products',
  description:
    'Browse Daily Device essentials from mice, keyboards, and headsets to accessories in one place.',
};

export const PRODUCT_DISCOUNTS_HERO_CONTENT: ProductAllHeroContent = {
  eyebrow: 'Special Offers',
  title: 'Special offers',
  description:
    'Find discounted Daily Device products and get the gear you need for less.',
};
