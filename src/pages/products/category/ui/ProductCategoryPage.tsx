import { Suspense } from 'react';

import { notFound } from 'next/navigation';

import { HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getLocale } from 'next-intl/server';

import {
  getFilterList,
  getProductColorFilterOptions,
  getProductPriceRange,
  getProductCategoryBySlug,
} from '@app/api-routes/products/filters/service';
import { getHeroList } from '@app/api-routes/products/hero/service';
import { getProductsPage } from '@app/api-routes/products/service';
import { getStaticProductCategoryParams } from '@app/api-routes/products/static-params/service';

import ProductFilterProvider from '@features/product-filter/model/context/ProductFilterContext';
import { productFilterQueryKeys } from '@features/product-filter/queries/queryKeys';

import { PRODUCT_LIST_STALE_TIME_MS } from '@entities/product/constants/cache';
import { PRODUCT_PAGE_SIZE } from '@entities/product/constants/pagination';
import { productQueryKeys } from '@entities/product/queries/queryKeys';

import { dehydrateWithPending } from '@shared/lib/query/dehydrateWithPending';

import ProductCategoryLoadingState from './ProductCategoryLoadingState';
import ProductCategoryPageContainer from './ProductCategoryPageContainer';

type ProductCategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export async function generateStaticParams() {
  return getStaticProductCategoryParams();
}

export default async function ProductCategoryPage({
  params,
}: ProductCategoryPageProps) {
  const { category } = await params;
  const locale = await getLocale();
  const normalizedCategory = decodeURIComponent(category).trim();
  const [productCategory, filterItems, priceRange, colorOptions] =
    await Promise.all([
      getProductCategoryBySlug(normalizedCategory),
      getFilterList(normalizedCategory, locale),
      getProductPriceRange(normalizedCategory),
      getProductColorFilterOptions(normalizedCategory, locale),
    ]);

  if (!productCategory) {
    notFound();
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: productQueryKeys.hero('product', normalizedCategory, locale),
    queryFn: () => getHeroList('product', normalizedCategory, locale),
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
  void queryClient.prefetchInfiniteQuery({
    queryKey: productQueryKeys.list({
      category: normalizedCategory,
      locale,
      sort: 'relevance',
      pageSize: PRODUCT_PAGE_SIZE,
      filtersKey: '',
      colorsKey: '',
      discountedOnly: false,
    }),
    initialPageParam: { page: 1, limit: PRODUCT_PAGE_SIZE },
    queryFn: ({ pageParam }) => {
      const productPageParam =
        typeof pageParam === 'number'
          ? { page: pageParam, limit: PRODUCT_PAGE_SIZE }
          : pageParam;

        return getProductsPage(
          normalizedCategory,
          productPageParam.page,
          productPageParam.limit,
          'relevance',
          [],
          {},
          {},
          {},
          locale,
        );
      },
    staleTime: PRODUCT_LIST_STALE_TIME_MS,
    gcTime: 30 * 60 * 1000,
  });
  queryClient.setQueryData(
    productFilterQueryKeys.filters(normalizedCategory, locale),
    filterItems,
  );

  return (
    <HydrationBoundary state={dehydrateWithPending(queryClient)}>
      <Suspense fallback={<ProductCategoryLoadingState />}>
        <ProductFilterProvider>
          <ProductCategoryPageContainer
            category={normalizedCategory}
            priceRange={priceRange}
            colorOptions={colorOptions}
          />
        </ProductFilterProvider>
      </Suspense>
    </HydrationBoundary>
  );
}
