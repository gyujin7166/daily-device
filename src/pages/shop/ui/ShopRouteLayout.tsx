import type { PropsWithChildren } from 'react';

import { HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { getCartByUserId } from '@app/api-routes/cart/service';
import { getWishlistList } from '@app/api-routes/wishlist/service';

import { cartQueryKeys } from '@entities/cart/queries/queryKeys';
import { wishlistQueryKeys } from '@entities/wishlist/queries/queryKeys';

import { dehydrateWithPending } from '@shared/lib/query/dehydrateWithPending';

import { auth } from 'auth';

import ShopLayout from './ShopLayout';

type ShopRouteLayoutProps = PropsWithChildren;

export default async function ShopRouteLayout({
  children,
}: ShopRouteLayoutProps) {
  const queryClient = new QueryClient();
  const session = await auth();
  if (session?.user?.id) {
    const userId = session.user.id;
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: cartQueryKeys.cart(),
        queryFn: () => getCartByUserId(userId),
        staleTime: 0,
      }),
      queryClient.prefetchQuery({
        queryKey: wishlistQueryKeys.list(),
        queryFn: () => getWishlistList(userId),
        staleTime: 0,
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrateWithPending(queryClient)}>
      <ShopLayout>{children}</ShopLayout>
    </HydrationBoundary>
  );
}
