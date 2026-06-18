import CatalogProductItemCard from './CatalogProductItemCard';
import DefaultProductItemCard from './DefaultProductItemCard';
import SearchProductItemCard from './SearchProductItemCard';

import type { ProductItemCardProps } from './productItemCardTypes';
import type { ProductItemVariant } from '../../model/productItem';

type ProductItemCardRootProps = ProductItemCardProps & {
  variant: ProductItemVariant;
};

export default function ProductItemCard({
  variant,
  ...cardProps
}: ProductItemCardRootProps) {
  if (variant === 'search') {
    return <SearchProductItemCard {...cardProps} />;
  }
  if (variant === 'catalog') {
    return <CatalogProductItemCard {...cardProps} />;
  }
  return <DefaultProductItemCard {...cardProps} />;
}
