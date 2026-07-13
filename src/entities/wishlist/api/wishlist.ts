import type {
  WishlistItem,
  WishlistMutationItem,
} from '@entities/wishlist/model/types';

import { fetchApi } from '@shared/api/fetchApi';

type WishlistActionResponse = {
  message?: string;
};

export const getWishlist = (locale?: string): Promise<WishlistItem[]> => {
  const params = new URLSearchParams();

  if (locale) {
    params.set('locale', locale);
  }

  const query = params.toString();

  return fetchApi(`/api/wishlist${query ? `?${query}` : ''}`);
};

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
