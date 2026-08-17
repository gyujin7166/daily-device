import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

import { ProductSkeleton } from '@entities/product/ui';

import MyPageSectionHeaderSkeleton from './MyPageSectionHeaderSkeleton';

type MyWishlistSkeletonProps = {
  menuButton?: ReactNode;
};

export default function MyWishlistSkeleton({
  menuButton,
}: MyWishlistSkeletonProps) {
  const t = useTranslations('MyWishlist.page');

  return (
    <div className="w-full rounded-2xl lg:pl-4">
      <MyPageSectionHeaderSkeleton
        label="WISHLIST"
        title={t('title')}
        descriptionClassName="w-40"
        actionClassName="w-24"
        menuButton={menuButton}
      />

      <div className="relative">
        <ProductSkeleton length={6} />
      </div>
    </div>
  );
}
