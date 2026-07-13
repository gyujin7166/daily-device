import { redirect } from 'next/navigation';

import { HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getLocale } from 'next-intl/server';

import { getAddresses } from '@app/api-routes/addresses/service';
import { getCartByUserId } from '@app/api-routes/cart/service';

import CheckoutProvider from '@features/checkout/model/context/CheckoutContext';
import { CheckoutPageContent } from '@features/checkout/ui/page';

import { addressQueryKeys } from '@entities/address/queries/queryKeys';
import { cartQueryKeys } from '@entities/cart/queries/queryKeys';

import { getLoginRedirectPath } from '@shared/lib/authRedirect';
import { dehydrateWithPending } from '@shared/lib/query/dehydrateWithPending';

import { auth } from 'auth';

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(getLoginRedirectPath('/checkout'));
  }
  const userId = session.user.id;
  const locale = await getLocale();

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: cartQueryKeys.cart(locale),
      queryFn: () => getCartByUserId(userId, locale),
      staleTime: 0,
    }),
    queryClient.prefetchQuery({
      queryKey: addressQueryKeys.userAddresses(),
      queryFn: () => getAddresses(userId),
      staleTime: 60 * 1000,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrateWithPending(queryClient)}>
      <CheckoutProvider>
        <CheckoutPageContent />
      </CheckoutProvider>
    </HydrationBoundary>
  );
}
