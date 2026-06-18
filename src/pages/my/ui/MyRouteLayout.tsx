import type { PropsWithChildren } from 'react';

import ShopLayout from '@pages/shop/ui/ShopLayout';

type MyRouteLayoutProps = PropsWithChildren;

export default function MyRouteLayout({ children }: MyRouteLayoutProps) {
  return <ShopLayout>{children}</ShopLayout>;
}
