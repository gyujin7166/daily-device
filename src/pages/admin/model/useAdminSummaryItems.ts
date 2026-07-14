import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Admin.summary');
  const heroItems = heroData?.heroes ?? [];
  const productHeroCount = heroItems.filter(
    (hero) => hero.heroType.name === 'product',
  ).length;

  if (activeTab === 'heroes') {
    return [
      { label: t('scope'), value: t('heroesScope') },
      { label: t('heroTotal'), value: heroItems.length || '-' },
      { label: t('productHero'), value: productHeroCount || '-' },
    ];
  }

  if (activeTab === 'home') {
    const sections = homeData?.sections ?? [];
    const itemCount = sections.reduce(
      (total, section) => total + section.items.length,
      0,
    );

    return [
      { label: t('scope'), value: t('homeScope') },
      { label: t('homeSections'), value: sections.length || '-' },
      { label: t('homeCards'), value: itemCount || '-' },
    ];
  }

  if (activeTab === 'products') {
    return [
      { label: t('scope'), value: t('productsScope') },
      {
        label: t('productTotal'),
        value: productData?.products.total ?? '-',
      },
      {
        label: t('categories'),
        value: productData?.categories.length ?? '-',
      },
    ];
  }

  return [
    { label: t('scope'), value: t('reviewsScope') },
    {
      label: t('visibleReviews'),
      value: reviewData?.summary.visible ?? '-',
    },
    {
      label: t('totalReviews'),
      value: reviewData?.summary.total ?? '-',
    },
  ];
};
