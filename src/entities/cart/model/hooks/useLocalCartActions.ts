import { isSameCartVariant } from '@entities/cart/lib/cartItemVariant';
import type { LocalCartItem } from '@entities/cart/model/types';

import { useCartContext } from '../context/CartContext';

import type { CartItem } from '@prisma/client';

export default function useLocalCartActions() {
  const { setLocalCartItems } = useCartContext();

  const updateLocalCart = (
    newItem: Pick<CartItem, 'productId' | 'quantity'> & {
      cartItemId?: number;
      productColorId?: number;
      colorName?: string;
      product?: LocalCartItem['product'];
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
        if (newItem.product) {
          return [
            ...updatedCart,
            {
              productId: newItem.productId,
              productColorId: newItem.productColorId ?? null,
              colorName: newItem.colorName ?? null,
              quantity: Math.min(newItem.quantity, 10),
              product: newItem.product,
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
