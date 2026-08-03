import { useCallback } from 'react';

import { isSameCartVariant } from '@entities/cart/lib/cartItemVariant';
import type { LocalCartItem, UserCartItem } from '@entities/cart/model/types';

import { useAddToCart } from '../../queries/useAddToCart';
import { useCartLocalStore } from '../store/cartLocalStore';

export default function useMergeLocalCart() {
  const { mutateAsync } = useAddToCart();
  const clearLocalCart = useCartLocalStore(
    (state) => state.actions.clearLocalCart,
  );

  const mergeLocalCart = useCallback(
    async (localCartItems: LocalCartItem[], userCartItems: UserCartItem[]) => {
      // 로그인 전 로컬 장바구니에는 같은 상품/색상이 중복 저장될 수 있어 서버 반영 전에 먼저 합친다.
      const mergedLocalItems = localCartItems.reduce<LocalCartItem[]>(
        (acc, item) => {
          const existingIndex = acc.findIndex((target) =>
            isSameCartVariant(target, item),
          );

          if (existingIndex >= 0) {
            const existingItem = acc[existingIndex];
            acc[existingIndex] = {
              ...existingItem,
              quantity: Math.min(existingItem.quantity + item.quantity, 10),
            };
            return acc;
          }

          acc.push({
            ...item,
            quantity: Math.min(item.quantity, 10),
          });
          return acc;
        },
        [],
      );

      await Promise.all(
        mergedLocalItems.map((item) => {
          const userCartItem = userCartItems.find((dbItem) =>
            isSameCartVariant(dbItem, item),
          );

          // 서버 장바구니에 이미 같은 variant가 있으면 수량을 더하되 상품별 최대 수량 제한은 유지한다.
          return mutateAsync({
            productId: item.productId,
            quantity: Math.min(
              userCartItem
                ? userCartItem.quantity + item.quantity
                : item.quantity,
              10,
            ),
            productColorId: item.productColorId ?? undefined,
            colorName: item.colorName ?? undefined,
          });
        }),
      );

      clearLocalCart();
    },
    [clearLocalCart, mutateAsync],
  );

  return { mergeLocalCart };
}
