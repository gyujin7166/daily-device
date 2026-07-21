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
