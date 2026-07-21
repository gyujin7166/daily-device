export type E2ESeedDataCounts = {
  categories: number;
  categoryTranslations: number;
  colors: number;
  colorTranslations: number;
  filterOptions: number;
  filterOptionTranslations: number;
  filters: number;
  filterTranslations: number;
  heroes: number;
  heroTranslations: number;
  homeSectionItems: number;
  homeSectionItemTranslations: number;
  homeSections: number;
  homeSectionTranslations: number;
  productDetails: number;
  productDetailTranslations: number;
  productImages: number;
  products: number;
  productTranslations: number;
};

export type E2ESeedDataCountReaders = {
  [Key in keyof E2ESeedDataCounts]: () => Promise<number>;
};

type RetryOptions = {
  maxAttempts: number;
  onRetry?: (nextAttempt: number, delayMs: number) => void;
  retryDelayMs: number;
  wait?: (delayMs: number) => Promise<void>;
};

const waitFor = (delayMs: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, delayMs));

export async function readE2ESeedDataCounts(
  readers: E2ESeedDataCountReaders,
): Promise<E2ESeedDataCounts> {
  return {
    categories: await readers.categories(),
    categoryTranslations: await readers.categoryTranslations(),
    colors: await readers.colors(),
    colorTranslations: await readers.colorTranslations(),
    filterOptions: await readers.filterOptions(),
    filterOptionTranslations: await readers.filterOptionTranslations(),
    filters: await readers.filters(),
    filterTranslations: await readers.filterTranslations(),
    heroes: await readers.heroes(),
    heroTranslations: await readers.heroTranslations(),
    homeSectionItems: await readers.homeSectionItems(),
    homeSectionItemTranslations: await readers.homeSectionItemTranslations(),
    homeSections: await readers.homeSections(),
    homeSectionTranslations: await readers.homeSectionTranslations(),
    productDetails: await readers.productDetails(),
    productDetailTranslations: await readers.productDetailTranslations(),
    productImages: await readers.productImages(),
    products: await readers.products(),
    productTranslations: await readers.productTranslations(),
  };
}

export async function retryE2EDatabaseOperation<Result>(
  operation: () => Promise<Result>,
  options: RetryOptions,
) {
  const { maxAttempts, onRetry, retryDelayMs, wait = waitFor } = options;

  if (maxAttempts < 1) {
    throw new Error('maxAttempts must be at least 1.');
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      const delayMs = retryDelayMs * attempt;
      onRetry?.(attempt + 1, delayMs);
      await wait(delayMs);
    }
  }

  throw new Error('E2E database operation exhausted its retry attempts.');
}

export function isE2ESeedDataReady(counts: E2ESeedDataCounts) {
  return (
    counts.products > 0 &&
    counts.productImages > 0 &&
    counts.productTranslations >= counts.products * 2 &&
    counts.productDetails > 0 &&
    counts.productDetailTranslations >= counts.productDetails * 2 &&
    counts.categories > 0 &&
    counts.categoryTranslations >= counts.categories * 2 &&
    counts.colors > 0 &&
    counts.colorTranslations >= counts.colors * 2 &&
    counts.filters > 0 &&
    counts.filterTranslations >= counts.filters * 2 &&
    counts.filterOptions > 0 &&
    counts.filterOptionTranslations >= counts.filterOptions * 2 &&
    counts.heroes > 0 &&
    counts.heroTranslations >= counts.heroes * 2 &&
    counts.homeSections > 0 &&
    counts.homeSectionTranslations >= counts.homeSections * 2 &&
    counts.homeSectionItems > 0 &&
    counts.homeSectionItemTranslations >= counts.homeSectionItems * 2
  );
}
