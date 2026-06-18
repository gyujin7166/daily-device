import type {
  WishlistItem,
  WishlistMutationItem,
} from '@entities/wishlist/model/types';

import { fetchApi } from '@shared/api/fetchApi';

type WishlistActionResponse = {
  message?: string;
};

export const getWishlist = (): Promise<WishlistItem[]> =>
  fetchApi('/api/wishlist');

export const upsertWishlist = (
  productId: number,
): Promise<WishlistMutationItem> =>
  fetchApi('/api/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  });

export const deleteWishlist = (
  productId: number,
): Promise<WishlistActionResponse> =>
  fetchApi(`/api/wishlist/${productId}`, {
    method: 'DELETE',
  });

export const clearWishlist = (): Promise<WishlistActionResponse> =>
  fetchApi('/api/wishlist', {
    method: 'DELETE',
  });
