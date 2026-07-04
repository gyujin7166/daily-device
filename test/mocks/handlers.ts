import { http, HttpResponse } from 'msw';

import type {
  CartResponse,
  LocalCartItem,
  UserCartItem,
} from '@entities/cart/model/types';
import type { OrderResponse } from '@entities/order/model/types';
import type { WishlistItem } from '@entities/wishlist/model/types';

export const TEST_API_URL = 'http://localhost:3000';

export const wishlistItemFixture: WishlistItem = {
  id: 1,
  image_url: '/images/product.webp',
  alt: 'MX MASTER',
  name: 'MX MASTER',
  description: '테스트 상품',
  price: 129_000,
  priceLabel: '129,000원',
  href: '/products/mice/mx-master',
  category: {
    name_en: 'Mice',
    slug: 'mice',
  },
};

export const cartItemFixture: UserCartItem = {
  id: 11,
  productId: 101,
  productColorId: 201,
  colorName: 'Graphite',
  quantity: 2,
  product: {
    id: 101,
    name_en: 'MX MASTER',
    slug: 'mx-master',
    price: 100_000,
    priceLabel: '100,000원',
    image_url: '/images/mx-master.webp',
  },
};

export const secondCartItemFixture: UserCartItem = {
  id: 12,
  productId: 102,
  productColorId: null,
  colorName: null,
  quantity: 1,
  product: {
    id: 102,
    name_en: 'KEYBOARD',
    slug: 'keyboard',
    price: 80_000,
    priceLabel: '80,000원',
    image_url: '/images/keyboard.webp',
  },
};

export const cartResponseFixture: CartResponse = {
  id: 1,
  items: [cartItemFixture, secondCartItemFixture],
  totalPrice: 280_000,
};

export const localCartItemFixture: LocalCartItem = {
  productId: cartItemFixture.productId,
  productColorId: cartItemFixture.productColorId,
  colorName: cartItemFixture.colorName,
  quantity: cartItemFixture.quantity,
  product: { ...cartItemFixture.product },
};

export const orderFixture: OrderResponse = {
  id: 301,
  orderNumber: 'DD-26070000001',
  createdAt: '2026-07-03T00:00:00.000Z',
  deliveryDate: null,
  status: 'CONFIRMED',
  orderShipping: {
    recipientName: '테스트 사용자',
    recipientPhone: '010-0000-0000',
    address1: '서울시 테스트구',
    address2: null,
  },
  orderItems: [
    {
      id: 401,
      productId: cartItemFixture.productId,
      productColorId: cartItemFixture.productColorId,
      productName: cartItemFixture.product.name_en,
      colorName: cartItemFixture.colorName,
      quantity: 2,
      reviewStatus: 'PENDING',
      price: cartItemFixture.product.price,
      product: {
        slug: cartItemFixture.product.slug,
        category: { slug: 'mice' },
        ProductImage: [
          {
            image_url: cartItemFixture.product.image_url,
            isMain: true,
            productColorId: cartItemFixture.productColorId,
            order: 1,
          },
        ],
      },
      colorHex: '#666666',
      colorId: 1,
      reviewWritten: false,
      reviewAdminHiddenAt: null,
    },
  ],
};

export const handlers = [
  http.get(`${TEST_API_URL}/api/wishlist`, () =>
    HttpResponse.json({
      items: [wishlistItemFixture],
      message: 'Success',
    }),
  ),
  http.post(`${TEST_API_URL}/api/wishlist`, async ({ request }) => {
    const body = (await request.json()) as { productId: number };

    return HttpResponse.json({
      items: {
        productId: body.productId,
        isWishlisted: true,
      },
      message: 'Success',
    });
  }),
  http.delete(`${TEST_API_URL}/api/wishlist/:productId`, () =>
    HttpResponse.json({ message: 'Success' }),
  ),
  http.delete(`${TEST_API_URL}/api/wishlist`, () =>
    HttpResponse.json({ message: 'Success' }),
  ),
  http.get(`${TEST_API_URL}/api/cart`, () =>
    HttpResponse.json({
      items: cartResponseFixture,
      message: 'Success',
    }),
  ),
  http.post(`${TEST_API_URL}/api/cart`, async ({ request }) => {
    const body = (await request.json()) as {
      productId: number;
      quantity: number;
      cartItemId?: number;
      productColorId?: number;
      colorName?: string;
    };
    const item = {
      ...cartItemFixture,
      id: body.cartItemId ?? cartItemFixture.id,
      productId: body.productId,
      productColorId: body.productColorId ?? null,
      colorName: body.colorName ?? null,
      quantity: body.quantity,
    };
    const cart: CartResponse = {
      id: cartResponseFixture.id,
      items: [item],
      totalPrice: item.product.price * item.quantity,
    };

    return HttpResponse.json({ items: cart, message: 'Success' });
  }),
  http.delete(`${TEST_API_URL}/api/cart/items/:cartItemId`, () =>
    HttpResponse.json({ items: { count: 1 }, message: 'Success' }),
  ),
  http.delete(`${TEST_API_URL}/api/cart`, () =>
    HttpResponse.json({ items: { count: 1 }, message: 'Success' }),
  ),
  http.get(`${TEST_API_URL}/api/orders`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 1);
    const isPagedRequest = url.searchParams.has('page');

    if (isPagedRequest) {
      return HttpResponse.json({
        items: [orderFixture],
        total: 1,
        page,
        limit,
        totalPages: 1,
        message: 'Success',
      });
    }

    return HttpResponse.json({
      items: [orderFixture],
      message: 'Success',
    });
  }),
  http.post(`${TEST_API_URL}/api/orders/:orderNumber/cancel`, () =>
    HttpResponse.json({ message: 'Success' }),
  ),
  http.post(`${TEST_API_URL}/api/orders/:orderNumber/confirm-delivery`, () =>
    HttpResponse.json({ message: 'Success' }),
  ),
  http.post(`${TEST_API_URL}/api/orders/:orderNumber/hide`, () =>
    HttpResponse.json({ message: 'Success' }),
  ),
];
