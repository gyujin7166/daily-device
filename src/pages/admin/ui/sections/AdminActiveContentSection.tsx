import type { AdminHeroPayload } from '@features/admin-hero/model/types';
import AdminHeroSection from '@features/admin-hero/ui/AdminHeroSection';
import type { AdminHomePayload } from '@features/admin-home/model/types';
import AdminHomeSection from '@features/admin-home/ui/AdminHomeSection';
import type {
  AdminProductListParams,
  AdminProductPayload,
} from '@features/admin-product/model/types';
import AdminProductSection from '@features/admin-product/ui/AdminProductSection';
import type {
  AdminReviewPayload,
  AdminReviewListParams,
  AdminReviewStatus,
} from '@features/admin-review/model/types';
import AdminReviewSection from '@features/admin-review/ui/AdminReviewSection';

import type { AdminTab } from '../../model/types';

type AdminActiveContentSectionProps = {
  activeTab: AdminTab;
  canWriteAdmin: boolean;
  heroData?: AdminHeroPayload;
  isHeroPending: boolean;
  homeData?: AdminHomePayload;
  isHomePending: boolean;
  productData?: AdminProductPayload;
  productParams: AdminProductListParams;
  isProductPending: boolean;
  isProductFetching: boolean;
  reviewData?: AdminReviewPayload;
  reviewParams: AdminReviewListParams;
  isReviewPending: boolean;
  isReviewFetching: boolean;
  onProductKeywordChange: (keyword: string) => void;
  onProductCategoryChange: (categoryId: string) => void;
  onProductPageChange: (page: number) => void;
  onReviewKeywordChange: (keyword: string) => void;
  onReviewStatusChange: (status: AdminReviewStatus) => void;
  onReviewPageChange: (page: number) => void;
  onMessage: (message: string) => void;
  onError: (message: string) => void;
  onReadOnlyAction: () => void;
};

export default function AdminActiveContentSection({
  activeTab,
  canWriteAdmin,
  heroData,
  isHeroPending,
  homeData,
  isHomePending,
  productData,
  productParams,
  isProductPending,
  isProductFetching,
  reviewData,
  reviewParams,
  isReviewPending,
  isReviewFetching,
  onProductKeywordChange,
  onProductCategoryChange,
  onProductPageChange,
  onReviewKeywordChange,
  onReviewStatusChange,
  onReviewPageChange,
  onMessage,
  onError,
  onReadOnlyAction,
}: AdminActiveContentSectionProps) {
  if (activeTab === 'heroes') {
    return (
      <AdminHeroSection
        data={heroData}
        isPending={isHeroPending}
        canWriteAdmin={canWriteAdmin}
        onMessage={onMessage}
        onError={onError}
        onReadOnlyAction={onReadOnlyAction}
      />
    );
  }

  if (activeTab === 'home') {
    return (
      <AdminHomeSection
        data={homeData}
        isPending={isHomePending}
        canWriteAdmin={canWriteAdmin}
        onMessage={onMessage}
        onError={onError}
        onReadOnlyAction={onReadOnlyAction}
      />
    );
  }

  if (activeTab === 'products') {
    return (
      <AdminProductSection
        data={productData}
        params={productParams}
        isPending={isProductPending}
        isFetching={isProductFetching}
        canWriteAdmin={canWriteAdmin}
        onKeywordChange={onProductKeywordChange}
        onCategoryChange={onProductCategoryChange}
        onPageChange={onProductPageChange}
        onMessage={onMessage}
        onError={onError}
        onReadOnlyAction={onReadOnlyAction}
      />
    );
  }

  return (
    <AdminReviewSection
      data={reviewData}
      isPending={isReviewPending}
      isFetching={isReviewFetching}
      canWriteAdmin={canWriteAdmin}
      params={reviewParams}
      onKeywordChange={onReviewKeywordChange}
      onStatusChange={onReviewStatusChange}
      onPageChange={onReviewPageChange}
      onMessage={onMessage}
      onError={onError}
      onReadOnlyAction={onReadOnlyAction}
    />
  );
}
