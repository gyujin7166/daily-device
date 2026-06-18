export const PRODUCT_LINE_VALUES = [
  'EVERYDAY_LINE',
  'BUSINESS_SERIES',
  'PERFORMANCE_SERIES',
] as const;

export type ProductLineValue = (typeof PRODUCT_LINE_VALUES)[number];

const PRODUCT_LINE_LABELS: Record<ProductLineValue, string> = {
  EVERYDAY_LINE: '데일리 라인',
  BUSINESS_SERIES: '비즈니스 라인',
  PERFORMANCE_SERIES: '퍼포먼스 라인',
};

export const PRODUCT_LINE_OPTIONS = PRODUCT_LINE_VALUES.map((value) => ({
  value,
  label: PRODUCT_LINE_LABELS[value],
}));

export const getProductLineLabel = (productLine?: string | null) => {
  if (!productLine) {
    return '';
  }

  return PRODUCT_LINE_LABELS[productLine as ProductLineValue] ?? productLine;
};

export const isProductLineValue = (value: unknown): value is ProductLineValue =>
  typeof value === 'string' &&
  PRODUCT_LINE_VALUES.includes(value as ProductLineValue);
