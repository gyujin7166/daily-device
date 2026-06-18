export const wishlistQueryKeys = {
  all: ['wishlist'] as const,
  list: () => [...wishlistQueryKeys.all, 'list'] as const,
  upsertMutation: () => [...wishlistQueryKeys.all, 'upsertMutation'] as const,
  deleteMutation: () => [...wishlistQueryKeys.all, 'deleteMutation'] as const,
  clearMutation: () => [...wishlistQueryKeys.all, 'clearMutation'] as const,
};
