import { homeSectionItemsBySectionKey } from './home-section-items';

import type { HomeSectionItemSeed } from './home-section-items';

export type HomeSectionSeed = {
  key: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  displayOrder: number;
  items: HomeSectionItemSeed[];
};

export const homeSections: HomeSectionSeed[] = [
  {
    key: 'featured-products',
    eyebrow: 'Featured',
    title: '매일의 작업을 바꾸는 제품',
    subtitle:
      '작업, 통화, 이동까지 이어지는 사용 흐름에 맞춰 제품을 골라보세요.',
    displayOrder: 1,
    items: homeSectionItemsBySectionKey['featured-products'],
  },
  {
    key: 'category-carousel',
    eyebrow: 'Categories',
    title: '원하는 환경에 맞는 제품군',
    subtitle:
      '사용 환경과 필요에 맞는 제품군을 한눈에 살펴보고 원하는 카테고리로 이동해보세요.',
    displayOrder: 2,
    items: homeSectionItemsBySectionKey['category-carousel'],
  },
];
