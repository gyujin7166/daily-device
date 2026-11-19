import type { ProductAssistantResult } from '../model/productAssistantResult';

const intent: ProductAssistantResult['intent'] = {
  categoryHint: 'mouse',
  hardRequirements: ['wireless'],
  preferences: ['quiet clicks'],
  priority: ['wireless', 'quiet clicks'],
  priceRange: { min: null, max: 100000, currency: 'KRW' },
  summary: 'A quiet wireless mouse under 100,000 KRW.',
};

const mapping: ProductAssistantResult['mapping'] = {
  category: { id: 2, slug: 'mice' },
  hardRequirements: [
    { requirement: 'wireless', filterId: 3, filterOptionId: 11 },
  ],
  preferences: [
    { requirement: 'quiet clicks', filterId: 4, filterOptionId: 15 },
  ],
  unmatchedHardRequirements: [],
  unmatchedPreferences: [],
};

const candidates: ProductAssistantResult['candidates'] = [
  {
    id: 102,
    name: 'Daily Device Wireless Mouse',
    slug: 'daily-device-wireless-mouse',
    description: 'A lightweight wireless mouse for everyday productivity.',
    categorySlug: 'mice',
    originalPrice: 79000,
    discountedPrice: 59250,
    discountRate: 25,
    matchedPreferences: ['quiet clicks'],
  },
  {
    id: 104,
    name: 'Breeze Silent Mouse',
    slug: 'breeze-silent-mouse',
    description: 'A silent-click mouse for shared offices.',
    categorySlug: 'mice',
    originalPrice: 45000,
    discountedPrice: 45000,
    discountRate: 0,
    matchedPreferences: ['quiet clicks'],
  },
];

export const recommendedResult: ProductAssistantResult = {
  intent,
  mapping,
  candidates,
  recommendation: {
    answer:
      '무선 연결과 조용한 클릭을 모두 확인할 수 있는 마우스 2개를 골랐어요. 할인 중인 제품을 먼저 살펴보세요.',
    recommendations: [
      {
        productId: 102,
        reason:
          '무선 연결을 지원하고, 현재 할인 중이라 예산 안에서 구매할 수 있어요.',
      },
      {
        productId: 104,
        reason: '저소음 클릭을 지원해 조용한 사무실에서 쓰기 좋아요.',
      },
    ],
  },
};

export const resultWithNotices: ProductAssistantResult = {
  ...recommendedResult,
  intent: {
    ...intent,
    hardRequirements: ['wireless', 'ergonomic for small hands'],
    priceRange: { min: null, max: 80, currency: 'USD' },
  },
  mapping: {
    ...mapping,
    unmatchedHardRequirements: ['ergonomic for small hands'],
  },
};

export const noCandidatesResult: ProductAssistantResult = {
  intent,
  mapping,
  candidates: [],
  recommendation: null,
};
