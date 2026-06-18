import type { CartResponse } from '@entities/cart/model/types';

import { fetchApi } from '@shared/api/fetchApi';

import type { Prisma } from '@prisma/client';

type AddToCartVariables = {
  productId: number;
  quantity: number;
  cartItemId?: number;
  productColorId?: number;
  colorName?: string;
  clientRevision?: number;
};

type DeleteCartItemVariables = {
  cartItemId?: number;
  productId: number;
  productColorId?: number;
  colorName?: string;
};

type DeleteCartItemResponse = Prisma.BatchPayload;

export const getCart = (): Promise<CartResponse> => fetchApi('/api/cart');

export const addToCart = ({
  productId,
  quantity,
  cartItemId,
  productColorId,
  colorName,
}: AddToCartVariables): Promise<CartResponse> =>
  fetchApi('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId,
      quantity,
      cartItemId,
      productColorId,
      colorName,
    }),
  });

export const deleteCartItem = ({
  cartItemId,
  productId,
  productColorId,
  colorName,
}: DeleteCartItemVariables): Promise<DeleteCartItemResponse> => {
  const endpoint =
    typeof cartItemId === 'number'
      ? `/api/cart/items/${cartItemId}`
      : '/api/cart';

  if (typeof cartItemId === 'number') {
    return fetchApi(endpoint, {
      method: 'DELETE',
    });
  }

  return fetchApi(endpoint, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, productColorId, colorName }),
  });
};
