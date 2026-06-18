export const productFilterQueryKeys = {
  all: ['product-filter'] as const,
  filters: (category?: string) =>
    [...productFilterQueryKeys.all, 'filters', category] as const,
};
