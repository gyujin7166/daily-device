import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';

import { getCart } from '@entities/cart/api/cart';
import type { CartResponse } from '@entities/cart/model/types';
import { cartQueryKeys } from '@entities/cart/queries/queryKeys';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

type UseCartOptions<TData> = {
  select?: (cart: CartResponse) => TData;
};

export const selectCartItems = (cart: CartResponse) => cart.items;

export const selectCartItemCount = (cart: CartResponse) => cart.items.length;

export const selectCartTotalQuantity = (cart: CartResponse) =>
  cart.items.reduce((total, item) => total + item.quantity, 0);

export const useCart = <TData = CartResponse>(
  options: UseCartOptions<TData> = {},
) => {
  const locale = useLocale();
  const { data: session } = useSession();
  return useQuery<CartResponse, Error, TData>({
    queryKey: cartQueryKeys.cart(locale),
    queryFn: () => getCart(locale),
    enabled: !!session?.user,
    staleTime: 0,
    retry: shouldRetryQuery,
    select: options.select,
  });
};
