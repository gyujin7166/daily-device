import type {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  OrderStatus as PrismaOrderStatus,
  ProductImage as PrismaProductImage,
  ReviewStatus as PrismaReviewStatus,
} from '@prisma/client';

export type OrderResponse = OrderListItem;

export type OrdersMode = 'all' | 'review' | 'review-written';

export type CreateOrderRequest = {
  items: Array<{
    productId: number;
    productColorId?: number;
    quantity: number;
  }>;
  isBuyNow?: boolean;
  userAddressId?: number;
  shipping?: {
    recipientName: string;
    recipientPhone: string;
    address1: string;
    address2?: string;
  };
  deliveryDate?: string;
  status?: 'PENDING' | 'CONFIRMED';
};

export type OrderListItem = Omit<
  Pick<PrismaOrder, 'id' | 'orderNumber' | 'createdAt' | 'deliveryDate'>,
  'createdAt' | 'deliveryDate'
> & {
  createdAt: string;
  deliveryDate: string | null;
  status: PrismaOrderStatus;
  orderShipping: {
    recipientName: string;
    recipientPhone: string;
    address1: string;
    address2: string | null;
  } | null;
  orderItems: Array<
    Pick<
      PrismaOrderItem,
      | 'id'
      | 'productId'
      | 'productColorId'
      | 'productName'
      | 'colorName'
      | 'quantity'
      | 'reviewStatus'
    > & {
      price: number;
      product: {
        slug: string;
        category: {
          slug: string;
        };
        ProductImage: Array<
          Pick<
            PrismaProductImage,
            'image_url' | 'isMain' | 'productColorId' | 'order'
          >
        >;
      };
      colorHex: string | null;
      colorId: number | null;
      reviewWritten: boolean;
      reviewAdminHiddenAt: string | null;
      reviewStatus: PrismaReviewStatus;
    }
  >;
};

export type OrderItem = OrderListItem['orderItems'][number];
