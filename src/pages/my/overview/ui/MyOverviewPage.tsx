import { redirect } from 'next/navigation';

import { HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { getAddresses } from '@app/api-routes/addresses/service';
import { getOrdersResultByMode } from '@app/api-routes/orders/service';

import { MyPageShell } from '@features/my/ui';

import { addressQueryKeys } from '@entities/address/queries/queryKeys';
import { orderQueryKeys } from '@entities/order/queries/queryKeys';

import { getLoginRedirectPath } from '@shared/lib/authRedirect';
import { dehydrateWithPending } from '@shared/lib/query/dehydrateWithPending';

import { auth } from 'auth';

import MyOverviewPageContainer from './MyOverviewPageContainer';

export default async function MyOverviewPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(getLoginRedirectPath('/my'));
  }
  const userId = session.user.id;

  const queryClient = new QueryClient();

  // 요약 화면에서는 최근 주문 1건만 필요하므로 첫 페이지를 1개만 프리패치한다.
  queryClient.prefetchQuery({
    queryKey: orderQueryKeys.suspensePaged('all', 1, 1),
    queryFn: () => getOrdersResultByMode(userId, 'all', 1, 1),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  // 기본 배송지 판별은 클라이언트 카드에서 수행하므로 전체 배송지 목록을 캐시에 준비한다.
  queryClient.prefetchQuery({
    queryKey: addressQueryKeys.suspenseUserAddresses(),
    queryFn: () => getAddresses(userId),
    staleTime: 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrateWithPending(queryClient)}>
      <MyPageShell activeTab="overview">
        <MyOverviewPageContainer session={session} />
      </MyPageShell>
    </HydrationBoundary>
  );
}
