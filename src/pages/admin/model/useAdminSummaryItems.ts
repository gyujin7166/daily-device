import type { AdminHeroPayload } from '@features/admin-hero/model/types';
import type { AdminHomePayload } from '@features/admin-home/model/types';
import type { AdminProductPayload } from '@features/admin-product/model/types';
import type { AdminReviewPayload } from '@features/admin-review/model/types';

import type { AdminSummaryItem, AdminTab } from './types';

type UseAdminSummaryItemsParams = {
  activeTab: AdminTab;
  heroData?: AdminHeroPayload;
  homeData?: AdminHomePayload;
  productData?: AdminProductPayload;
  reviewData?: AdminReviewPayload;
};

export const useAdminSummaryItems = ({
  activeTab,
  heroData,
  homeData,
  productData,
  reviewData,
}: UseAdminSummaryItemsParams): AdminSummaryItem[] => {
  const heroItems = heroData?.heroes ?? [];
  const productHeroCount = heroItems.filter(
    (hero) => hero.heroType.name === 'product',
  ).length;

  if (activeTab === 'heroes') {
    return [
      { label: '관리 영역', value: 'HERO' },
      { label: 'Hero 전체', value: heroItems.length || '-' },
      { label: '상품 Hero', value: productHeroCount || '-' },
    ];
  }

  if (activeTab === 'home') {
    const sections = homeData?.sections ?? [];
    const itemCount = sections.reduce(
      (total, section) => total + section.items.length,
      0,
    );

    return [
      { label: '관리 영역', value: '홈' },
      { label: '홈 섹션', value: sections.length || '-' },
      { label: '홈 카드', value: itemCount || '-' },
    ];
  }

  if (activeTab === 'products') {
    return [
      { label: '관리 영역', value: '상품' },
      {
        label: '상품 전체',
        value: productData?.products.total ?? '-',
      },
      {
        label: '카테고리',
        value: productData?.categories.length ?? '-',
      },
    ];
  }

  return [
    { label: '관리 영역', value: '상품평' },
    {
      label: '상품평 공개',
      value: reviewData?.summary.visible ?? '-',
    },
    {
      label: '상품평 전체',
      value: reviewData?.summary.total ?? '-',
    },
  ];
};
