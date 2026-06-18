import type {
  Color as PrismaColor,
  Filter as PrismaFilter,
  FilterOption as PrismaFilterOption,
  Hero as PrismaHero,
  Product as PrismaProduct,
  ProductCategory as PrismaProductCategory,
  ProductColor as PrismaProductColor,
  ProductDetail as PrismaProductDetail,
  ProductImage as PrismaProductImage,
} from '@prisma/client';

export type FilterWithOptions = PrismaFilter & {
  filterOption: PrismaFilterOption[];
};

export type ProductColorOption = Pick<
  PrismaProductColor,
  'id' | 'isDefault'
> & {
  color: Pick<PrismaColor, 'name' | 'hex'>;
};

export type ProductColorFilterOption = Pick<PrismaColor, 'id' | 'name' | 'hex'>;

export type CatalogProductFilterMap = {
  [filterId: string]: number[];
};

export type CatalogProductItem = Pick<
  PrismaProduct,
  'id' | 'name_en' | 'slug' | 'description' | 'productLine'
> & {
  price: number;
  originalPrice: number;
  discountedPrice: number;
  discountRate: number;
  isDiscounted: boolean;
  priceLabel: string;
  originalPriceLabel: string;
  discountedPriceLabel: string;
  category: PrismaProductCategory;
  filter: CatalogProductFilterMap[];
  ProductImage: Array<
    Pick<
      PrismaProductImage,
      'image_url' | 'isMain' | 'productColorId' | 'order'
    >
  >;
  productColor: ProductColorOption[];
};

export type ProductDetailResponse = {
  product:
    | (Pick<
        PrismaProduct,
        | 'id'
        | 'productLine'
        | 'name_en'
        | 'slug'
        | 'description'
        | 'detailed_description'
      > & {
        price: number;
        originalPrice: number;
        discountedPrice: number;
        discountRate: number;
        isDiscounted: boolean;
        priceLabel: string;
        originalPriceLabel: string;
        discountedPriceLabel: string;
        category: Pick<PrismaProductCategory, 'name_en' | 'name_ko' | 'slug'>;
        productColor: ProductColorOption[];
      })
    | null;
  productDetails: Array<
    Pick<
      PrismaProductDetail,
      'id' | 'titleId' | 'title_middle' | 'title_sub' | 'specification' | 'note'
    >
  >;
};

export type ProductImageItem = Pick<
  PrismaProductImage,
  'id' | 'image_url' | 'order' | 'isMain' | 'productColorId'
>;

export type HeroSummaryItem = Pick<
  PrismaHero,
  | 'id'
  | 'name_en'
  | 'name_ko'
  | 'description'
  | 'detailed_description'
  | 'position'
  | 'image_url'
  | 'textTone'
  | 'navTone'
  | 'overlayTone'
>;

export type HeroTypeValue =
  | 'main'
  | 'product'
  | 'product-all'
  | 'product-discounts';
