export type MyTab =
  | 'overview'
  | 'orders'
  | 'wishlist'
  | 'address'
  | 'write-review'
  | 'reviews';

const toMyTabPath = (tab: MyTab) => {
  switch (tab) {
    case 'overview':
      return '/my';
    case 'orders':
      return '/my/orders';
    case 'wishlist':
      return '/my/wishlist';
    case 'address':
      return '/my/address';
    case 'write-review':
      return '/my/reviews/write';
    case 'reviews':
      return '/my/reviews';
    default:
      return '/my';
  }
};

export const MY_TAB_PATHS: Record<MyTab, string> = {
  overview: toMyTabPath('overview'),
  orders: toMyTabPath('orders'),
  wishlist: toMyTabPath('wishlist'),
  address: toMyTabPath('address'),
  'write-review': toMyTabPath('write-review'),
  reviews: toMyTabPath('reviews'),
};
