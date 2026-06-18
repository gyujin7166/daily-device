export const getQueryPageParam = (pageParam: unknown) =>
  typeof pageParam === 'number' && Number.isFinite(pageParam) ? pageParam : 1;
