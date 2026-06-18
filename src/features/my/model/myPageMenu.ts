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
  label: string;
  tab: MyTab;
  icon: Icon;
};

export const MY_PAGE_MENU_ITEMS: MyPageMenuItem[] = [
  { label: '요약', tab: 'overview', icon: IconLayoutDashboard },
  { label: '주문 목록', tab: 'orders', icon: IconShoppingBag },
  { label: '찜한 상품', tab: 'wishlist', icon: IconHeart },
  { label: '배송지 관리', tab: 'address', icon: IconMapPin },
  { label: '상품평 작성', tab: 'write-review', icon: IconPencil },
  { label: '작성한 상품평', tab: 'reviews', icon: IconStar },
];
