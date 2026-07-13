import { useTranslations } from 'next-intl';

import type { MyTab } from '@shared/constants/myRoutes';

import MyPageMobileMenuButton from './MyPageMobileMenuButton';
import MyAddressSkeleton from './skeletons/MyAddressSkeleton';
import MyPageOrdersSkeleton from './skeletons/MyPageOrdersSkeleton';
import MyPageOverviewSkeleton from './skeletons/MyPageOverviewSkeleton';
import MyWishlistSkeleton from './skeletons/MyWishlistSkeleton';

type MyPageContentFallbackProps = {
  tab: MyTab;
};

export default function MyPageContentFallback({
  tab,
}: MyPageContentFallbackProps) {
  const t = useTranslations('MyPage.fallback');
  const menuButton = <MyPageMobileMenuButton />;

  if (tab === 'overview') {
    return <MyPageOverviewSkeleton menuButton={menuButton} />;
  }

  if (tab === 'wishlist') {
    return <MyWishlistSkeleton menuButton={menuButton} />;
  }

  if (tab === 'address') {
    return <MyAddressSkeleton menuButton={menuButton} />;
  }

  if (tab === 'reviews') {
    return (
      <MyPageOrdersSkeleton
        pageClassName="w-full rounded-2xl lg:pl-4"
        pageLabel="REVIEWS"
        pageTitle={t('reviews.title')}
        pageDescription={t('reviews.description')}
        menuButton={menuButton}
        itemCount={4}
      />
    );
  }

  if (tab === 'write-review') {
    return (
      <MyPageOrdersSkeleton
        pageClassName="w-full rounded-2xl lg:pl-4"
        pageLabel="WRITE REVIEW"
        pageTitle={t('writeReview.title')}
        pageDescription={t('writeReview.description')}
        menuButton={menuButton}
      />
    );
  }

  return (
    <MyPageOrdersSkeleton
      pageClassName="w-full rounded-2xl lg:pl-4"
      pageLabel="ORDERS"
      pageTitle={t('orders.title')}
      pageDescription={t('orders.description')}
      menuButton={menuButton}
    />
  );
}
