import { HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getLocale } from 'next-intl/server';

import { getHeroList } from '@app/api-routes/products/hero/service';
import { getProductsPage } from '@app/api-routes/products/service';

import { PRODUCT_LIST_STALE_TIME_MS } from '@entities/product/constants/cache';
import { PRODUCT_GRID_PAGE_SIZE } from '@entities/product/constants/pagination';
import type { HeroTypeValue } from '@entities/product/model/types';
import { productQueryKeys } from '@entities/product/queries/queryKeys';

import { dehydrateWithPending } from '@shared/lib/query/dehydrateWithPending';

import ProductAllPageContainer from './ProductAllPageContainer';

type ProductAllRoutePageProps = {
  discountedOnly?: boolean;
};

async function ProductAllRoutePage({
  discountedOnly: forcedDiscountedOnly = false,
}: ProductAllRoutePageProps) {
  const discountedOnly = forcedDiscountedOnly;
  const heroType: HeroTypeValue = discountedOnly
    ? 'product-discounts'
    : 'product-all';
  const locale = await getLocale();
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: productQueryKeys.hero(heroType, undefined, locale),
    queryFn: () => getHeroList(heroType, undefined, locale),
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
  void queryClient.prefetchInfiniteQuery({
    queryKey: productQueryKeys.list({
      category: undefined,
      locale,
      sort: 'relevance',
      pageSize: PRODUCT_GRID_PAGE_SIZE,
      filtersKey: '',
      colorsKey: '',
      discountedOnly,
    }),
    initialPageParam: { page: 1, limit: PRODUCT_GRID_PAGE_SIZE },
    queryFn: ({ pageParam }) =>
      getProductsPage(
        undefined,
        typeof pageParam === 'number' ? pageParam : pageParam.page,
        typeof pageParam === 'number'
          ? PRODUCT_GRID_PAGE_SIZE
          : pageParam.limit,
        'relevance',
        [],
        {},
        {},
        {
          discountedOnly,
        },
        locale,
      ),
    staleTime: PRODUCT_LIST_STALE_TIME_MS,
    gcTime: 30 * 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrateWithPending(queryClient)}>
      <ProductAllPageContainer discountedOnly={discountedOnly} />
    </HydrationBoundary>
  );
}

export async function ProductDiscountsPage() {
  return <ProductAllRoutePage discountedOnly />;
}

export default async function ProductAllPage() {
  return <ProductAllRoutePage />;
}
