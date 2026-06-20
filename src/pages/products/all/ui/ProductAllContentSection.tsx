import { ProductList } from '@features/product/ui';

import type { CatalogProductItem } from '@entities/product/model/types';

import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

type ProductAllContentSectionProps = {
  products: CatalogProductItem[];
  isPending: boolean;
  totalProducts?: number;
  hasNextPage?: boolean;
  fetchNextPage?: () => void | Promise<void>;
  isFetchingNextPage?: boolean;
  isRefreshing?: boolean;
  resetKey?: string;
};

export default function ProductAllContentSection({
  products,
  isPending,
  totalProducts,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  isRefreshing,
  resetKey,
}: ProductAllContentSectionProps) {
  return (
    <section className="overflow-hidden bg-canvas py-8 text-ink sm:py-10 dark:bg-dark-bg dark:text-surface">
      <PageWrapper>
        <ProductList
          products={products}
          isPending={isPending}
          columns="four"
          totalCount={totalProducts}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isRefreshing={isRefreshing}
          resetKey={resetKey}
        />
      </PageWrapper>
    </section>
  );
}
