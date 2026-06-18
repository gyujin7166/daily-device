import { ProductItem } from '@features/product/ui';
import type { SearchResultItem } from '@features/search/model/types';

import { ProductCard } from '@entities/product/ui';

import NoSearchResults from './NoSearchResults';

type SearchResultsProps = {
  items: SearchResultItem[];
  searchTerm: string;
};

export default function SearchResults({
  items,
  searchTerm,
}: SearchResultsProps) {
  if (items.length === 0) {
    return <NoSearchResults searchTerm={searchTerm ?? ''} />;
  }

  return (
    <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, index) => (
        <ProductCard key={item.id} width="w-full">
          <ProductItem
            product={item}
            variant="catalog"
            priorityImage={index < 4}
          />
        </ProductCard>
      ))}
    </div>
  );
}
