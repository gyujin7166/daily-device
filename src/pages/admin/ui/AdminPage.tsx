'use client';
import { useState } from 'react';

import { useAdminHeroesQuery } from '@features/admin-hero/queries/useAdminHero';
import { useAdminHomeSectionsQuery } from '@features/admin-home/queries/useAdminHome';
import { useAdminProductListParams } from '@features/admin-product/model/useAdminProductListParams';
import { useAdminProductsQuery } from '@features/admin-product/queries/useAdminProduct';
import { useAdminReviewListParams } from '@features/admin-review/model/useAdminReviewListParams';
import { useAdminReviewsQuery } from '@features/admin-review/queries/useAdminReview';

import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

import { useAdminFeedback } from '../model/useAdminFeedback';
import { useAdminRefresh } from '../model/useAdminRefresh';
import { useAdminSummaryItems } from '../model/useAdminSummaryItems';

import AdminActiveContentSection from './sections/AdminActiveContentSection';
import AdminFeedbackSection from './sections/AdminFeedbackSection';
import AdminPageHeaderSection from './sections/AdminPageHeaderSection';
import AdminSummarySection from './sections/AdminSummarySection';
import AdminTabSection from './sections/AdminTabSection';

import type { AdminTab } from '../model/types';

export default function AdminPage({
  canWriteAdmin,
}: {
  canWriteAdmin: boolean;
}) {
  const [activeTab, setActiveTab] = useState<AdminTab>('heroes');
  const { message, error, showMessage, showError, showReadOnlyNotice } =
    useAdminFeedback();
  const {
    params: reviewParams,
    updateKeyword: updateReviewKeyword,
    updateStatus: updateReviewStatus,
    updatePage: updateReviewPage,
  } = useAdminReviewListParams();
  const {
    params: productParams,
    updateKeyword: updateProductKeyword,
    updateCategory: updateProductCategory,
    updatePage: updateProductPage,
  } = useAdminProductListParams();
  const { data: heroData, isPending: isHeroPending } = useAdminHeroesQuery(
    activeTab === 'heroes',
  );
  const { data: homeData, isPending: isHomePending } =
    useAdminHomeSectionsQuery(activeTab === 'home');
  const {
    data: productData,
    isPending: isProductPending,
    isFetching: isProductFetching,
  } = useAdminProductsQuery(productParams, activeTab === 'products');
  const {
    data: reviewData,
    isPending: isReviewPending,
    isFetching: isReviewFetching,
  } = useAdminReviewsQuery(reviewParams, activeTab === 'reviews');
  const refreshActiveTab = useAdminRefresh(activeTab);
  const summaryItems = useAdminSummaryItems({
    activeTab,
    heroData,
    homeData,
    productData,
    reviewData,
  });

  return (
    <main className="min-h-screen bg-canvas pb-12 pt-27.5 text-ink dark:bg-dark-bg dark:text-surface">
      <PageWrapper className="flex flex-col gap-6">
        <AdminPageHeaderSection onRefresh={refreshActiveTab} />
        <AdminSummarySection items={summaryItems} />
        <AdminTabSection activeTab={activeTab} onTabChange={setActiveTab} />
        <AdminFeedbackSection
          canWriteAdmin={canWriteAdmin}
          message={message}
          error={error}
        />
        <AdminActiveContentSection
          activeTab={activeTab}
          canWriteAdmin={canWriteAdmin}
          heroData={heroData}
          isHeroPending={isHeroPending}
          homeData={homeData}
          isHomePending={isHomePending}
          productData={productData}
          productParams={productParams}
          isProductPending={isProductPending}
          isProductFetching={isProductFetching}
          reviewData={reviewData}
          reviewParams={reviewParams}
          isReviewPending={isReviewPending}
          isReviewFetching={isReviewFetching}
          onProductKeywordChange={updateProductKeyword}
          onProductCategoryChange={updateProductCategory}
          onProductPageChange={updateProductPage}
          onReviewKeywordChange={updateReviewKeyword}
          onReviewStatusChange={updateReviewStatus}
          onReviewPageChange={updateReviewPage}
          onMessage={showMessage}
          onError={showError}
          onReadOnlyAction={showReadOnlyNotice}
        />
      </PageWrapper>
    </main>
  );
}
