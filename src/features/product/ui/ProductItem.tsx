'use client';
import { memo, useState } from 'react';

import { useProductItemActions } from '../model/hooks/useProductItemActions';
import {
  getDefaultProductItemColor,
  getProductItemViewModel,
} from '../model/productItem';

import ProductItemCard from './ProductItemCard/ProductItemCard';

import type {
  ProductItemProduct,
  ProductItemSelectedColor,
} from '../model/productItem';

type ProductItemProps = {
  product: ProductItemProduct;
  backgroundClassName?: string;
  priorityImage?: boolean;
};

function ProductItem({
  product,
  backgroundClassName = 'bg-surface dark:bg-dark-panel',
  priorityImage = false,
}: ProductItemProps) {
  const [selectedColor, setSelectedColor] =
    useState<ProductItemSelectedColor | null>(() =>
      getDefaultProductItemColor(product.productColor),
    );
  const viewModel = getProductItemViewModel(product, selectedColor);
  const fallbackColor = viewModel.firstColor ?? undefined;
  const {
    wishlistItem,
    isInWishlist,
    canAddToCart,
    handleToggleWishlist,
    handleAddToCart,
  } = useProductItemActions({
    product,
    hasColors: viewModel.hasColors,
    selectedColor,
    fallbackColor,
  });
  const cardProps = {
    product,
    viewModel,
    backgroundClassName,
    priorityImage,
    selectedColor,
    onColorChange: setSelectedColor,
    hasWishlistItem: !!wishlistItem,
    isInWishlist,
    canAddToCart,
    onToggleWishlist: handleToggleWishlist,
    onAddToCart: handleAddToCart,
  };

  return <ProductItemCard {...cardProps} />;
}

export default memo(ProductItem);
