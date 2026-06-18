type SearchParamsLike = { toString(): string } | null | undefined;

export const createCurrentPath = (
  pathname: string | null | undefined,
  searchParams?: SearchParamsLike,
  fallback = '/',
) => {
  const resolvedPathname = pathname ?? fallback;
  const queryString = searchParams?.toString();

  return queryString ? `${resolvedPathname}?${queryString}` : resolvedPathname;
};
