import { redirect } from 'next/navigation';

import { HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { getOrdersResultByMode } from '@app/api-routes/orders/service';

import { MyPageShell } from '@features/my/ui';

import { orderQueryKeys } from '@entities/order/queries/queryKeys';

import { MyOrdersContainer } from '@widgets/my-orders/ui';

import { getLoginRedirectPath } from '@shared/lib/authRedirect';
import { dehydrateWithPending } from '@shared/lib/query/dehydrateWithPending';

import { auth } from 'auth';

export default async function MyOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(getLoginRedirectPath('/my/orders'));
  }
  const userId = session.user.id;

  const queryClient = new QueryClient();

  queryClient.prefetchQuery({
    queryKey: orderQueryKeys.paged('all', 1, 5),
    queryFn: () => getOrdersResultByMode(userId, 'all', 1, 5),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrateWithPending(queryClient)}>
      <MyPageShell activeTab="orders">
        <MyOrdersContainer embedded />
      </MyPageShell>
    </HydrationBoundary>
  );
}
