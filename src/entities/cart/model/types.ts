import type {
  Cart as PrismaCart,
  CartItem as PrismaCartItem,
  Product as PrismaProduct,
  ProductCategory as PrismaProductCategory,
} from '@prisma/client';

type CartProductSummary = Pick<PrismaProduct, 'id' | 'name_en' | 'slug'> & {
  price: number;
  originalPrice?: number;
  discountedPrice?: number;
  discountRate?: number;
  isDiscounted?: boolean;
  priceLabel?: string;
  originalPriceLabel?: string;
  discountedPriceLabel?: string;
  image_url: string;
  category?: Pick<PrismaProductCategory, 'name_en' | 'slug'>;
};

export type UserCartItem = Pick<
  PrismaCartItem,
  'id' | 'productId' | 'productColorId' | 'colorName' | 'quantity'
> & {
  product: CartProductSummary;
};

export type CartResponse = Pick<PrismaCart, 'id'> & {
  items: UserCartItem[];
  totalPrice: number;
};

export type LocalCartItem = {
  productId: number;
  productColorId?: number | null;
  colorName?: string | null;
  quantity: number;
  product: {
    id: number;
    name_en: string;
    slug?: string;
    price: number;
    originalPrice?: number;
    discountedPrice?: number;
    discountRate?: number;
    isDiscounted?: boolean;
    priceLabel?: string;
    originalPriceLabel?: string;
    discountedPriceLabel?: string;
    image_url: string;
    category?: {
      name_en: string;
      slug?: string;
    };
  };
};
