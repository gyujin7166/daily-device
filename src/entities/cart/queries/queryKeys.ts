export const cartQueryKeys = {
  all: ['cart'] as const,
  cart: (locale?: string) => [...cartQueryKeys.all, 'cart', locale] as const,
};

export const cartMutationKeys = {
  all: ['cart-mutation'] as const,
  addToCart: () => [...cartMutationKeys.all, 'add-to-cart'] as const,
  deleteCartItem: () => [...cartMutationKeys.all, 'delete-cart-item'] as const,
};
