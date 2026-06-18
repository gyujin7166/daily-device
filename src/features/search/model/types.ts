import type {
  Color as PrismaColor,
  Product as PrismaProduct,
  ProductCategory as PrismaProductCategory,
  ProductColor as PrismaProductColor,
  ProductImage as PrismaProductImage,
} from '@prisma/client';

type SearchProductColorOption = Pick<PrismaProductColor, 'id' | 'isDefault'> & {
  color: Pick<PrismaColor, 'name' | 'hex'>;
};

export type SearchResultItem = Pick<
  PrismaProduct,
  'id' | 'name_en' | 'slug' | 'name_ko' | 'description' | 'productLine'
> & {
  price: number;
  originalPrice?: number;
  discountedPrice?: number;
  discountRate?: number;
  isDiscounted?: boolean;
  priceLabel?: string;
  originalPriceLabel?: string;
  discountedPriceLabel?: string;
  ProductImage: Array<
    Pick<
      PrismaProductImage,
      'image_url' | 'isMain' | 'productColorId' | 'order'
    >
  >;
  category: Pick<PrismaProductCategory, 'name_en' | 'slug'>;
  productColor: SearchProductColorOption[];
};

export type SearchSuggestionItem = Pick<
  PrismaProduct,
  'id' | 'name_en' | 'slug' | 'name_ko'
>;

export type SearchSortOption =
  | 'relevance'
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc';
