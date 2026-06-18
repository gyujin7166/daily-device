import type {
  Color as PrismaColor,
  Product as PrismaProduct,
  ProductCategory as PrismaProductCategory,
  ProductColor as PrismaProductColor,
  ProductImage as PrismaProductImage,
} from '@prisma/client';

export type WishlistProductColor = Pick<PrismaProductColor, 'id'> & {
  isDefault?: boolean;
  color: Pick<PrismaColor, 'name' | 'hex'>;
};

export type WishlistItem = {
  id: Pick<PrismaProduct, 'id'>['id'];
  image_url: string;
  ProductImage?: Array<
    Pick<
      PrismaProductImage,
      'image_url' | 'isMain' | 'productColorId' | 'order'
    >
  >;
  alt: string;
  productLine?: Pick<PrismaProduct, 'productLine'>['productLine'];
  name?: Pick<PrismaProduct, 'name_en'>['name_en'];
  description?: Pick<PrismaProduct, 'description'>['description'];
  price?: number;
  priceLabel?: string;
  originalPrice?: number;
  originalPriceLabel?: string;
  discountedPrice?: number;
  discountedPriceLabel?: string;
  discountRate?: number;
  isDiscounted?: boolean;
  href?: string;
  productColor?: WishlistProductColor[];
  category?: Pick<PrismaProductCategory, 'name_en' | 'slug'>;
};

export type WishlistMutationItem = {
  productId: Pick<PrismaProduct, 'id'>['id'];
  isWishlisted: boolean;
};
