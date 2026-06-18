import { redirect } from 'next/navigation';

import { HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { getAddresses } from '@app/api-routes/addresses/service';

import { MyPageShell } from '@features/my/ui';

import { addressQueryKeys } from '@entities/address/queries/queryKeys';

import { getLoginRedirectPath } from '@shared/lib/authRedirect';
import { dehydrateWithPending } from '@shared/lib/query/dehydrateWithPending';

import { auth } from 'auth';

import MyAddressContainer from './MyAddressContainer';

export default async function MyAddressPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(getLoginRedirectPath('/my/address'));
  }
  const userId = session.user.id;

  const queryClient = new QueryClient();

  queryClient.prefetchQuery({
    queryKey: addressQueryKeys.suspenseUserAddresses('authenticated', true),
    queryFn: () => getAddresses(userId),
    staleTime: 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrateWithPending(queryClient)}>
      <MyPageShell activeTab="address">
        <MyAddressContainer />
      </MyPageShell>
    </HydrationBoundary>
  );
}
