import { redirect } from 'next/navigation';

import { HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { getWishlistList } from '@app/api-routes/wishlist/service';

import { MyPageShell } from '@features/my/ui';

import { wishlistQueryKeys } from '@entities/wishlist/queries/queryKeys';

import { getLoginRedirectPath } from '@shared/lib/authRedirect';
import { dehydrateWithPending } from '@shared/lib/query/dehydrateWithPending';

import { auth } from 'auth';

import MyWishlistContainer from './MyWishlistContainer';

export default async function MyWishlistPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(getLoginRedirectPath('/my/wishlist'));
  }
  const userId = session.user.id;

  const queryClient = new QueryClient();

  queryClient.prefetchQuery({
    queryKey: wishlistQueryKeys.list(),
    queryFn: () => getWishlistList(userId),
    staleTime: 0,
  });

  return (
    <HydrationBoundary state={dehydrateWithPending(queryClient)}>
      <MyPageShell activeTab="wishlist">
        <MyWishlistContainer />
      </MyPageShell>
    </HydrationBoundary>
  );
}
