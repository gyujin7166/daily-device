import type { UserCartItem } from '@entities/cart/model/types';
import type { ProductDetailResponse } from '@entities/product/model/types';

type ProductDetail = NonNullable<ProductDetailResponse['product']>;

export type SelectedProductColor = {
  id: number;
  name: string;
};

type BuildBuyNowItemParams = {
  product: ProductDetail | null | undefined;
  mainImageUrl?: string;
  selectedColor?: SelectedProductColor;
  quantity?: number;
};

export const formatProductDetailPrice = (price?: number) => {
  if (price === undefined) {
    return '-';
  }

  return price >= 1000
    ? `${price.toLocaleString('ko-KR')}원`
    : `$${price.toFixed(2)}`;
};

export const getProductDetailSectionIds = (
  productDetails: ProductDetailResponse['productDetails'],
) =>
  Array.from(new Set(productDetails.map((item) => item.titleId)))
    .sort((a, b) => a - b)
    .filter((titleId) => titleId !== 4);

export const buildBuyNowItem = ({
  product,
  mainImageUrl,
  selectedColor,
  quantity = 1,
}: BuildBuyNowItemParams): UserCartItem | null => {
  if (!product) {
    return null;
  }

  return {
    id: -Date.now(),
    productId: product.id,
    quantity,
    productColorId: selectedColor?.id ?? null,
    colorName: selectedColor?.name ?? null,
    product: {
      id: product.id,
      name_en: product.name_en,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice,
      discountRate: product.discountRate,
      isDiscounted: product.isDiscounted,
      priceLabel: product.priceLabel,
      originalPriceLabel: product.originalPriceLabel,
      discountedPriceLabel: product.discountedPriceLabel,
      image_url: mainImageUrl ?? '',
      category: product.category?.name_en
        ? { name_en: product.category.name_en, slug: product.category.slug }
        : undefined,
    },
  };
};
