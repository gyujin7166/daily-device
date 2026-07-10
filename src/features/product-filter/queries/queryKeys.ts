export const productFilterQueryKeys = {
  all: ['product-filter'] as const,
  filters: (category?: string, locale?: string) =>
    [...productFilterQueryKeys.all, 'filters', category, locale] as const,
};
