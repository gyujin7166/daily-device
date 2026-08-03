import type { ProductDetailResponse } from '@entities/product/model/types';

export const PRODUCT_DETAIL_LABEL = {
  '1': 'details',
  '2': 'compatibility',
  '3': 'included',
  '4': 'support',
} as const;

export const getProductDetailLabelKey = (sectionKey: string) =>
  PRODUCT_DETAIL_LABEL[sectionKey as keyof typeof PRODUCT_DETAIL_LABEL] ??
  'fallback';

export const SUPPORT_LINKS = [
  { id: 1, href: '#', labelKey: 'manual' },
  { id: 2, href: '#', labelKey: 'faq' },
  { id: 3, href: '#', labelKey: 'register' },
] as const;

type ProductDetailItem = ProductDetailResponse['productDetails'][number];

type ProductDetailSpecificationItem = ProductDetailItem & {
  specifications: string[];
};

export type ProductDetailSpecificationGroup = {
  id: string;
  titleMiddle: string;
  items: ProductDetailSpecificationItem[];
};

const parseProductDetailSpecifications = (specification?: string | null) => {
  if (!specification) {
    return [];
  }

  try {
    const parsed = JSON.parse(specification);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
};

export const getProductDetailSpecificationGroups = (
  productDetails: ProductDetailResponse['productDetails'],
  sectionId: number,
): ProductDetailSpecificationGroup[] => {
  const sectionItems = productDetails.filter(
    (item) => item.titleId === sectionId,
  );
  const titleMiddleValues = Array.from(
    new Set(sectionItems.map((item) => item.title_middle ?? '')),
  );

  return titleMiddleValues
    .map((titleMiddle, groupIndex) => ({
      id: `${sectionId}-${titleMiddle || groupIndex}`,
      titleMiddle,
      items: sectionItems
        .filter((item) => (item.title_middle ?? '') === titleMiddle)
        .map((item) => ({
          ...item,
          specifications: parseProductDetailSpecifications(item.specification),
        })),
    }))
    .filter((group) => group.items.length > 0);
};

export const splitProductDetailSpecification = (specification: string) => {
  const separatorIndex = specification.indexOf(':');

  if (separatorIndex === -1) {
    return {
      label: null,
      value: specification,
    };
  }

  return {
    label: specification.slice(0, separatorIndex).trim(),
    value: specification.slice(separatorIndex + 1).trim(),
  };
};
