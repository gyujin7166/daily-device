import SearchHeaderSkeleton from '@features/search/ui/SearchHeaderSkeleton';

import ProductSkeleton from '@entities/product/ui/ProductSkeleton';

import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

const SEARCH_PRODUCT_SKELETON_COUNT = 12;

export default function SearchLoading() {
  return (
    <PageWrapper as="main" className="mt-22.5 min-h-[50vh]">
      <SearchHeaderSkeleton />
      <ProductSkeleton
        variant="product"
        columns="four"
        length={SEARCH_PRODUCT_SKELETON_COUNT}
      />
    </PageWrapper>
  );
}
