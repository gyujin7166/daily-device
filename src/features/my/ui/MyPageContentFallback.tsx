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
        pageTitle="작성한 상품평"
        pageDescription="작성한 상품평 내역을 확인해 보세요."
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
        pageTitle="상품평 작성"
        pageDescription="상품평을 작성할 주문을 선택해 보세요."
        menuButton={menuButton}
      />
    );
  }

  return (
    <MyPageOrdersSkeleton
      pageClassName="w-full rounded-2xl lg:pl-4"
      pageLabel="ORDERS"
      pageTitle="주문 목록"
      pageDescription="주문 내역을 확인해 보세요."
      menuButton={menuButton}
    />
  );
}
