import { notFound, redirect } from 'next/navigation';

import { HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { getOrdersListByUserId } from '@app/api-routes/orders/service';
import { getReviewWriteData } from '@app/api-routes/product-reviews/service';

import { orderQueryKeys } from '@entities/order/queries/queryKeys';

import { getLoginRedirectPath } from '@shared/lib/authRedirect';
import { dehydrateWithPending } from '@shared/lib/query/dehydrateWithPending';

import { auth } from 'auth';

import ReviewWritePageContainer from './ReviewWritePageContainer';

type ReviewWritePageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
  searchParams: Promise<{
    productId?: string;
    colorId?: string;
    deliveryDate?: string;
  }>;
};

export default async function MyReviewsWriteOrderPage({
  params,
  searchParams,
}: ReviewWritePageProps) {
  const { orderNumber } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(getLoginRedirectPath(`/my/reviews/write/${orderNumber}`));
  }

  const {
    productId = '',
    colorId: rawColorId,
    deliveryDate = '',
  } = await searchParams;
  if (!productId || !deliveryDate) {
    notFound();
  }

  const parsedProductId = Number(productId);
  if (Number.isNaN(parsedProductId)) {
    notFound();
  }

  const colorId =
    rawColorId && rawColorId !== 'null' ? Number(rawColorId) : null;
  if (rawColorId && rawColorId !== 'null' && Number.isNaN(colorId)) {
    notFound();
  }

  const targetDate = new Date(deliveryDate);
  if (Number.isNaN(targetDate.getTime())) {
    notFound();
  }

  const userId = session.user.id;
  const reviewWriteData = await getReviewWriteData({
    userId,
    orderNumber,
    productId: parsedProductId,
    colorId,
    deliveryDate: targetDate,
  });

  if (!reviewWriteData) {
    notFound();
  }

  const { orderItemId, productReview, reviewAdminHiddenAt } = reviewWriteData;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: orderQueryKeys.list(),
    queryFn: () => getOrdersListByUserId(userId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrateWithPending(queryClient)}>
      <ReviewWritePageContainer
        orderNumber={orderNumber}
        productId={parsedProductId}
        colorId={colorId}
        orderItemId={orderItemId}
        productReview={productReview}
        reviewAdminHiddenAt={reviewAdminHiddenAt}
      />
    </HydrationBoundary>
  );
}
