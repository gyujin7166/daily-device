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
