export const PRODUCT_ALL_HERO_MIN_HEIGHT_CLASS_NAME =
  'min-h-[28vh] supports-[height:100svh]:min-h-[28svh] sm:min-h-[32vh] sm:supports-[height:100svh]:min-h-[32svh] md:min-h-[42vh] md:supports-[height:100svh]:min-h-[42svh] lg:min-h-[50vh]';

export const PRODUCT_ALL_HERO_VIEWPORT_OFFSET_TOP_PX = 90;

export type ProductAllHeroContent = {
  eyebrow: string;
  title: string;
  description: string;
};

export const PRODUCT_ALL_HERO_CONTENT: ProductAllHeroContent = {
  eyebrow: 'Products',
  title: '전체 상품',
  description:
    '마우스, 키보드, 헤드셋부터 액세서리까지 Daily Device의 대표 상품을 한곳에서 확인해보세요.',
};

export const PRODUCT_DISCOUNTS_HERO_CONTENT: ProductAllHeroContent = {
  eyebrow: 'Special Offers',
  title: '특가 상품',
  description:
    '지금 할인 중인 Daily Device 제품을 한곳에서 확인하고 필요한 기기를 더 합리적으로 만나보세요.',
};
