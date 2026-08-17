import type { MouseEventHandler } from 'react';

import type {
  getProductItemViewModel,
  ProductItemProduct,
  ProductItemSelectedColor,
} from '../../model/productItem';

type ProductItemViewModel = ReturnType<typeof getProductItemViewModel>;

export type ProductItemCardProps = {
  product: ProductItemProduct;
  viewModel: ProductItemViewModel;
  backgroundClassName: string;
  priorityImage: boolean;
  selectedColor: ProductItemSelectedColor | null;
  onColorChange: (color: ProductItemSelectedColor) => void;
  isInWishlist: boolean;
  canAddToCart: boolean;
  hasWishlistItem: boolean;
  onToggleWishlist: MouseEventHandler<HTMLButtonElement>;
  onAddToCart: MouseEventHandler<HTMLButtonElement>;
};
