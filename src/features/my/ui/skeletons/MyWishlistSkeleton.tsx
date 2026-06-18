import type { ReactNode } from 'react';

import { ProductSkeleton } from '@entities/product/ui';

import MyPageSectionHeaderSkeleton from './MyPageSectionHeaderSkeleton';

type MyWishlistSkeletonProps = {
  menuButton?: ReactNode;
  itemCount?: number;
};

export default function MyWishlistSkeleton({
  menuButton,
  itemCount = 6,
}: MyWishlistSkeletonProps) {
  return (
    <div className="w-full rounded-2xl lg:pl-4">
      <MyPageSectionHeaderSkeleton
        label="WISHLIST"
        title="찜한 상품"
        descriptionClassName="w-40"
        actionClassName="w-24"
        menuButton={menuButton}
      />

      <div className="relative">
        <ProductSkeleton variant="product" length={itemCount} />
      </div>
    </div>
  );
}
