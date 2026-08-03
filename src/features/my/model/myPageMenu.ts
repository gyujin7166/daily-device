import {
  IconHeart,
  IconLayoutDashboard,
  IconMapPin,
  IconPencil,
  IconShoppingBag,
  IconStar,
} from '@tabler/icons-react';

import type { MyTab } from '@shared/constants/myRoutes';

import type { Icon } from '@tabler/icons-react';

type MyPageMenuItem = {
  labelKey:
    | 'overview'
    | 'orders'
    | 'wishlist'
    | 'address'
    | 'writeReview'
    | 'reviews';
  tab: MyTab;
  icon: Icon;
};

export const MY_PAGE_MENU_ITEMS: MyPageMenuItem[] = [
  { labelKey: 'overview', tab: 'overview', icon: IconLayoutDashboard },
  { labelKey: 'orders', tab: 'orders', icon: IconShoppingBag },
  { labelKey: 'wishlist', tab: 'wishlist', icon: IconHeart },
  { labelKey: 'address', tab: 'address', icon: IconMapPin },
  { labelKey: 'writeReview', tab: 'write-review', icon: IconPencil },
  { labelKey: 'reviews', tab: 'reviews', icon: IconStar },
];

export const getMyTabFromPathname = (pathname: string): MyTab => {
  const myPathStart = pathname.indexOf('/my');
  const myPath = myPathStart >= 0 ? pathname.slice(myPathStart) : pathname;

  if (myPath.startsWith('/my/reviews/write')) {
    return 'write-review';
  }
  if (myPath.startsWith('/my/reviews')) {
    return 'reviews';
  }
  if (myPath.startsWith('/my/orders')) {
    return 'orders';
  }
  if (myPath.startsWith('/my/wishlist')) {
    return 'wishlist';
  }
  if (myPath.startsWith('/my/address')) {
    return 'address';
  }

  return 'overview';
};
