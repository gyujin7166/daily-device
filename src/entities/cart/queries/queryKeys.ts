export const cartQueryKeys = {
  all: ['cart'] as const,
  cart: () => [...cartQueryKeys.all, 'cart'] as const,
};

export const cartMutationKeys = {
  all: ['cart-mutation'] as const,
  addToCart: () => [...cartMutationKeys.all, 'add-to-cart'] as const,
  deleteCartItem: () => [...cartMutationKeys.all, 'delete-cart-item'] as const,
};
