import { redirect } from 'next/navigation';

import { HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { getOrdersListByUserId } from '@app/api-routes/orders/service';

import { orderQueryKeys } from '@entities/order/queries/queryKeys';

import { getLoginRedirectPath } from '@shared/lib/authRedirect';
import { dehydrateWithPending } from '@shared/lib/query/dehydrateWithPending';

import { auth } from 'auth';

import MyOrderDetailContainer from './MyOrderDetailContainer';

type OrderDetailPageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export default async function MyOrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { orderNumber } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(getLoginRedirectPath(`/my/orders/${orderNumber}`));
  }
  const userId = session.user.id;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: orderQueryKeys.list(),
    queryFn: () => getOrdersListByUserId(userId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrateWithPending(queryClient)}>
      <MyOrderDetailContainer orderNumber={orderNumber} />
    </HydrationBoundary>
  );
}
