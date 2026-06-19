import type { PropsWithChildren } from 'react';

import ShopLayout from './ShopLayout';

type ShopRouteLayoutProps = PropsWithChildren;

export default function ShopRouteLayout({ children }: ShopRouteLayoutProps) {
  return <ShopLayout>{children}</ShopLayout>;
}
