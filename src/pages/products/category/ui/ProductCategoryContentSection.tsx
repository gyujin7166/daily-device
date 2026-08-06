import type { ReactNode } from 'react';

import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

type ProductCategoryContentSectionProps = {
  sidebar: ReactNode;
  filterBar: ReactNode;
  productResults: ReactNode;
};

export default function ProductCategoryContentSection({
  sidebar,
  filterBar,
  productResults,
}: ProductCategoryContentSectionProps) {
  return (
    <section className="bg-canvas py-8 text-ink sm:py-10 dark:bg-dark-bg dark:text-surface">
      <PageWrapper>
        <div className="flex flex-col gap-8 lg:flex-row">
          {sidebar}
          <div className="min-w-0 flex-1">
            {filterBar}
            {productResults}
          </div>
        </div>
      </PageWrapper>
    </section>
  );
}
