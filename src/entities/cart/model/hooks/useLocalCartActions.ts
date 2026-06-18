import { isSameCartVariant } from '@entities/cart/lib/cartItemVariant';
import { getProductThumbnailUrlBySelectedColor } from '@entities/product/model/productImages';
import { useProduct } from '@entities/product/queries/useProduct';

import { IMAGE_FALLBACK_URL } from '@shared/constants/images';

import { useCartContext } from '../context/CartContext';

import type { CartItem } from '@prisma/client';

export default function useLocalCartActions() {
  const { setLocalCartItems } = useCartContext();
  const { data: products } = useProduct();

  const updateLocalCart = (
    newItem: Pick<CartItem, 'productId' | 'quantity'> & {
      cartItemId?: number;
      productColorId?: number;
      colorName?: string;
    },
  ) => {
    setLocalCartItems((prev) => {
      const updatedCart = prev.map((item) =>
        isSameCartVariant(item, newItem)
          ? {
              ...item,
              quantity: Math.min(newItem.quantity, 10),
              productColorId: newItem.productColorId ?? item.productColorId,
              colorName: newItem.colorName ?? item.colorName,
            }
          : item,
      );

      if (!updatedCart.some((item) => isSameCartVariant(item, newItem))) {
        const newProduct = products?.find(
          (product) => product.id === newItem.productId,
        );
        if (newProduct) {
          return [
            ...updatedCart,
            {
              productId: newProduct.id,
              productColorId: newItem.productColorId ?? null,
              colorName: newItem.colorName ?? null,
              quantity: Math.min(newItem.quantity, 10),
              product: {
                id: newProduct.id,
                name_en: newProduct.name_en,
                price: Number(newProduct.price),
                originalPrice: newProduct.originalPrice,
                discountedPrice: newProduct.discountedPrice,
                discountRate: newProduct.discountRate,
                isDiscounted: newProduct.isDiscounted,
                priceLabel: newProduct.priceLabel,
                originalPriceLabel: newProduct.originalPriceLabel,
                discountedPriceLabel: newProduct.discountedPriceLabel,
                image_url:
                  getProductThumbnailUrlBySelectedColor(
                    newProduct.ProductImage,
                    newItem.productColorId,
                  ) ?? IMAGE_FALLBACK_URL,
              },
            },
          ];
        }
      }

      return updatedCart;
    });
  };

  const deleteLocalCartItem = (
    selectedItem: Pick<CartItem, 'productId'> & {
      productColorId?: number;
      colorName?: string;
    },
  ) => {
    setLocalCartItems((prev) =>
      prev.filter((item) => !isSameCartVariant(item, selectedItem)),
    );
    localStorage.removeItem('localCart');
  };

  return {
    updateLocalCart,
    deleteLocalCartItem,
  };
}
