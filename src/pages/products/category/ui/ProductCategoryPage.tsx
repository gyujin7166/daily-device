import { Suspense } from 'react';

import { notFound } from 'next/navigation';

import { HydrationBoundary, QueryClient } from '@tanstack/react-query';

import {
  getFilterList,
  getProductColorFilterOptions,
  getProductPriceRange,
  getProductCategoryBySlug,
} from '@app/api-routes/products/filters/service';
import { getHeroList } from '@app/api-routes/products/hero/service';
import { getProductsPage } from '@app/api-routes/products/service';

import ProductFilterProvider from '@features/product-filter/model/context/ProductFilterContext';
import { productFilterQueryKeys } from '@features/product-filter/queries/queryKeys';

import { PRODUCT_PAGE_SIZE } from '@entities/product/constants/pagination';
import { productQueryKeys } from '@entities/product/queries/queryKeys';

import { dehydrateWithPending } from '@shared/lib/query/dehydrateWithPending';

import ProductCategoryLoadingState from './ProductCategoryLoadingState';
import ProductCategoryPageContainer from './ProductCategoryPageContainer';

type ProductCategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const parsePriceSearchParam = (value: string | string[] | undefined) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (!rawValue) {
    return undefined;
  }

  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? parsedValue
    : undefined;
};

const parseColorSearchParam = (value: string | string[] | undefined) => {
  const rawValue = Array.isArray(value) ? value.join(',') : (value ?? '');

  return Array.from(
    new Set(
      rawValue
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isInteger(item) && item > 0),
    ),
  ).sort((a, b) => a - b);
};

export default async function ProductCategoryPage({
  params,
  searchParams,
}: ProductCategoryPageProps) {
  const { category } = await params;
  const normalizedCategory = decodeURIComponent(category).trim();
  const resolvedSearchParams = await searchParams;
  const rawFiltersValue = resolvedSearchParams.filters;
  const rawFilters = Array.isArray(rawFiltersValue)
    ? rawFiltersValue.join(',')
    : (rawFiltersValue ?? '');
  const [productCategory, filterItems, priceRange, colorOptions] =
    await Promise.all([
      getProductCategoryBySlug(normalizedCategory),
      getFilterList(normalizedCategory),
      getProductPriceRange(normalizedCategory),
      getProductColorFilterOptions(normalizedCategory),
    ]);

  if (!productCategory) {
    notFound();
  }

  const validFilterNames = new Set(
    filterItems.flatMap((group) =>
      group.filterOption.map((option) => option.name_en),
    ),
  );
  const parsedFilters = rawFilters
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .sort();
  const hasInvalidFilter = parsedFilters.some(
    (value) => !validFilterNames.has(value),
  );
  const normalizedFilters = hasInvalidFilter ? [] : parsedFilters;
  const filtersKey = normalizedFilters.join(',');
  const rawMinPrice = parsePriceSearchParam(resolvedSearchParams.minPrice);
  const rawMaxPrice = parsePriceSearchParam(resolvedSearchParams.maxPrice);
  const clampedMinPrice =
    typeof rawMinPrice === 'number'
      ? Math.min(
          Math.max(rawMinPrice, priceRange.minPrice),
          priceRange.maxPrice,
        )
      : undefined;
  const clampedMaxPrice =
    typeof rawMaxPrice === 'number'
      ? Math.min(
          Math.max(rawMaxPrice, priceRange.minPrice),
          priceRange.maxPrice,
        )
      : undefined;
  const normalizedMinPrice =
    typeof clampedMinPrice === 'number' &&
    typeof clampedMaxPrice === 'number' &&
    clampedMinPrice > clampedMaxPrice
      ? clampedMaxPrice
      : clampedMinPrice;
  const normalizedMaxPrice =
    typeof clampedMinPrice === 'number' &&
    typeof clampedMaxPrice === 'number' &&
    clampedMinPrice > clampedMaxPrice
      ? clampedMinPrice
      : clampedMaxPrice;
  const validColorIds = new Set(colorOptions.map((color) => color.id));
  const normalizedColorIds = parseColorSearchParam(
    resolvedSearchParams.colors,
  ).filter((colorId) => validColorIds.has(colorId));
  const colorsKey = normalizedColorIds.join(',');
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: productQueryKeys.hero('product', normalizedCategory),
      queryFn: () => getHeroList('product', normalizedCategory),
      staleTime: 60 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: productQueryKeys.list({
        category: normalizedCategory,
        sort: 'relevance',
        pageSize: PRODUCT_PAGE_SIZE,
        filtersKey,
        colorsKey,
        minPrice: normalizedMinPrice,
        maxPrice: normalizedMaxPrice,
        discountedOnly: false,
      }),
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getProductsPage(
          normalizedCategory,
          Number(pageParam),
          PRODUCT_PAGE_SIZE,
          'relevance',
          normalizedFilters,
          {
            minPrice: normalizedMinPrice,
            maxPrice: normalizedMaxPrice,
          },
          {
            colorIds: normalizedColorIds,
          },
        ),
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),
  ]);
  queryClient.setQueryData(
    productFilterQueryKeys.filters(normalizedCategory),
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
