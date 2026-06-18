import 'server-only';

import { OrderStatus, ReviewStatus } from '@prisma/client';

import { generateOrderNumber } from '@entities/order/lib/generateOrderNumber';
import type { OrderListItem, OrdersMode } from '@entities/order/model/types';

import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '@shared/lib/errors/httpError';
import { getProductPriceInfo } from '@shared/lib/price/discount';

import prisma from 'prisma/prismaClientSingleton';

import { expirePendingOrders } from './expirePendingOrders';

import type { Prisma } from '@prisma/client';

type OrdersResult = {
  items: OrderListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const orderSelect = {
  id: true,
  orderNumber: true,
  createdAt: true,
  deliveryDate: true,
  status: true,
  orderShipping: {
    select: {
      recipientName: true,
      recipientPhone: true,
      address1: true,
      address2: true,
    },
  },
  orderItems: {
    select: {
      id: true,
      productId: true,
      productColorId: true,
      productName: true,
      colorName: true,
      quantity: true,
      price: true,
      reviewStatus: true,
      ProductReview: {
        select: { id: true, adminHiddenAt: true },
      },
      product: {
        select: {
          slug: true,
          category: {
            select: {
              slug: true,
            },
          },
          ProductImage: {
            select: {
              image_url: true,
              isMain: true,
              productColorId: true,
              order: true,
            },
            orderBy: [
              { productColorId: 'asc' },
              { order: 'asc' },
              { id: 'asc' },
            ],
          },
        },
      },
    },
  },
} satisfies Prisma.OrderSelect;

type RawOrder = Prisma.OrderGetPayload<{ select: typeof orderSelect }>;

const paginateOrders = (
  orders: OrderListItem[],
  page: number,
  limit: number,
): OrdersResult => {
  const total = orders.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const end = start + limit;

  return {
    items: orders.slice(start, end),
    total,
    page: safePage,
    limit,
    totalPages,
  };
};

const applyModeFilter = (orders: OrderListItem[], mode: OrdersMode) => {
  const visibleOrders = orders.filter((order) => order.status !== 'PENDING');

  if (mode === 'all') {
    return visibleOrders;
  }

  const shouldIncludeWritten = mode === 'review-written';

  return visibleOrders
    .map((order) => ({
      ...order,
      orderItems:
        order.status === 'DELIVERED'
          ? order.orderItems.filter((item) =>
              shouldIncludeWritten ? item.reviewWritten : !item.reviewWritten,
            )
          : [],
    }))
    .filter((order) => order.orderItems.length > 0);
};

async function syncReviewStatus(userId: string) {
  await prisma.orderItem.updateMany({
    where: {
      order: { userId },
      ProductReview: { some: { userId } },
      reviewStatus: { not: ReviewStatus.COMPLETED },
    },
    data: { reviewStatus: ReviewStatus.COMPLETED },
  });
}

async function findOrders(
  userId: string,
  options: {
    excludePending?: boolean;
    skip?: number;
    take?: number;
  } = {},
): Promise<RawOrder[]> {
  const { excludePending = false, skip, take } = options;

  return prisma.order.findMany({
    where: {
      userId,
      userHiddenAt: null,
      ...(excludePending ? { status: { not: 'PENDING' } } : {}),
    },
    select: orderSelect,
    orderBy: { createdAt: 'desc' },
    ...(typeof skip === 'number' ? { skip } : {}),
    ...(typeof take === 'number' ? { take } : {}),
  });
}

async function normalizeOrders(orders: RawOrder[]): Promise<OrderListItem[]> {
  const colorNames = Array.from(
    new Set(
      orders
        .flatMap((order) => order.orderItems)
        .map((item) => item.colorName)
        .filter((colorName): colorName is string => Boolean(colorName)),
    ),
  );

  const colors =
    colorNames.length > 0
      ? await prisma.color.findMany({
          where: { name: { in: colorNames } },
          select: { id: true, name: true, hex: true },
        })
      : [];
  const colorMap = new Map(colors.map((color) => [color.name, color]));

  return orders.map((order): OrderListItem => {
    const [shipping] = order.orderShipping;

    const orderItemsWithColors = order.orderItems.map((item) => {
      const { ProductReview, ...rest } = item;
      const parsedPrice = Number(rest.price);
      const matchedColor =
        rest.productColorId && rest.colorName
          ? colorMap.get(rest.colorName)
          : undefined;

      return {
        ...rest,
        price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
        colorHex: matchedColor?.hex ?? null,
        colorId: matchedColor?.id ?? null,
        reviewWritten: ProductReview.length > 0,
        reviewAdminHiddenAt:
          ProductReview.find(
            (review) => review.adminHiddenAt !== null,
          )?.adminHiddenAt?.toISOString() ?? null,
      };
    });

    return {
      ...order,
      createdAt: order.createdAt.toISOString(),
      deliveryDate: order.deliveryDate?.toISOString() ?? null,
      orderShipping: shipping
        ? {
            recipientName: shipping.recipientName,
            recipientPhone: shipping.recipientPhone,
            address1: shipping.address1,
            address2: shipping.address2 ?? null,
          }
        : null,
      orderItems: orderItemsWithColors,
    };
  });
}

async function getAllModeOrdersResult(
  userId: string,
  page?: number,
  limit?: number,
): Promise<OrdersResult> {
  const usePagination = typeof page === 'number' && typeof limit === 'number';

  if (!usePagination) {
    const rawOrders = await findOrders(userId, { excludePending: true });
    const items = await normalizeOrders(rawOrders);

    return {
      items,
      total: items.length,
      page: 1,
      limit: items.length,
      totalPages: 1,
    };
  }

  const safeLimit = Math.max(limit, 1);
  const total = await prisma.order.count({
    where: { userId, userHiddenAt: null, status: { not: 'PENDING' } },
  });
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const rawOrders = await findOrders(userId, {
    excludePending: true,
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  });
  const items = await normalizeOrders(rawOrders);

  return {
    items,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
  };
}

export async function getOrdersResultByMode(
  userId: string,
  mode: OrdersMode,
  page?: number,
  limit?: number,
): Promise<OrdersResult> {
  const usePagination = typeof page === 'number' && typeof limit === 'number';

  await expirePendingOrders();

  if (mode === 'all') {
    return getAllModeOrdersResult(userId, page, limit);
  }

  await syncReviewStatus(userId);
  const rawOrders = await findOrders(userId);
  const allOrders = await normalizeOrders(rawOrders);
  const filteredOrders = applyModeFilter(allOrders, mode);

  return usePagination
    ? paginateOrders(filteredOrders, page, limit)
    : {
        items: filteredOrders,
        total: filteredOrders.length,
        page: 1,
        limit: filteredOrders.length,
        totalPages: 1,
      };
}

export async function getOrdersListByUserId(
  userId: string,
): Promise<OrderListItem[]> {
  const result = await getOrdersResultByMode(userId, 'all');
  return result.items;
}

type CreateOrderParams = {
  userId: string;
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
  deliveryDate?: string | null;
  status?: OrderStatus;
};

type CreateOrderResult = {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
};

export async function assertUserAddressOwnership(
  userId: string,
  addressId: number,
) {
  const address = await prisma.userAddress.findUnique({
    where: { id: addressId },
    select: { id: true, userId: true },
  });

  if (!address) {
    throw new NotFoundError('Address not found');
  }

  if (address.userId !== userId) {
    throw new ForbiddenError();
  }
}

export async function createOrderForUser(
  params: CreateOrderParams,
): Promise<CreateOrderResult> {
  const { userId, items, userAddressId, shipping, deliveryDate, status } =
    params;
  const normalizedStatus = status ?? OrderStatus.CONFIRMED;
  const isBuyNow = Boolean(params.isBuyNow);

  return prisma.$transaction(async (tx) => {
    let recipientName: string;
    let recipientPhone: string;
    let address1: string;
    let address2: string | null = null;

    if (userAddressId) {
      const address = await tx.userAddress.findFirst({
        where: { id: userAddressId, userId },
        select: {
          recipientName: true,
          recipientPhone: true,
          address1: true,
          address2: true,
        },
      });

      if (!address) throw new NotFoundError('Saved address not found');

      await tx.userAddress.updateMany({
        where: { id: userAddressId, userId },
        data: {
          recipientName: address.recipientName,
          recipientPhone: address.recipientPhone,
          address1: address.address1,
          address2: address.address2 ?? null,
        },
      });

      recipientName = address.recipientName;
      recipientPhone = address.recipientPhone;
      address1 = address.address1;
      address2 = address.address2 ?? null;
    } else {
      if (
        !shipping?.recipientName ||
        !shipping?.recipientPhone ||
        !shipping?.address1
      ) {
        throw new BadRequestError('Shipping information is required');
      }
      recipientName = shipping.recipientName;
      recipientPhone = shipping.recipientPhone;
      address1 = shipping.address1;
      address2 = shipping.address2 ?? null;
    }

    const productIds = Array.from(new Set(items.map((it) => it.productId)));

    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, discountRate: true, name_en: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const productColorIds = Array.from(
      new Set(
        items
          .map((it) => it.productColorId)
          .filter((id): id is number => typeof id === 'number'),
      ),
    );
    const productColors = await tx.productColor.findMany({
      where: {
        id: {
          in: productColorIds,
        },
      },
      select: {
        id: true,
        productId: true,
        color: {
          select: {
            name: true,
          },
        },
      },
    });
    const productColorMap = new Map(productColors.map((pc) => [pc.id, pc]));

    const validatedItems = items.map((it) => {
      const product = productMap.get(it.productId);
      if (!product) throw new NotFoundError('Product not found');

      const quantity = Math.max(1, Math.min(it.quantity, 10));
      const parsedPrice = Number(product.price);
      const priceInfo = getProductPriceInfo(
        Number.isFinite(parsedPrice) ? parsedPrice : 0,
        product.discountRate,
      );
      const selectedProductColorId = it.productColorId ?? null;
      let colorName: string | null = null;

      if (selectedProductColorId !== null) {
        const productColor = productColorMap.get(selectedProductColorId);
        if (!productColor || productColor.productId !== product.id) {
          throw new BadRequestError('Invalid product color');
        }
        colorName = productColor.color.name;
      }

      return {
        productId: product.id,
        productColorId: selectedProductColorId,
        quantity,
        price: priceInfo.price,
        productName: product.name_en,
        colorName,
      };
    });

    const totalAmount = validatedItems.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0,
    );

    const orderNumber = generateOrderNumber();
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        status: normalizedStatus,
        isBuyNow,
      },
      select: { id: true, orderNumber: true, status: true },
    });

    if (normalizedStatus === OrderStatus.CONFIRMED && !isBuyNow) {
      const cart = await tx.cart.findFirst({
        where: { userId },
        select: { id: true },
      });

      if (cart) {
        const orderedCartItemConditions = Array.from(
          new Map(
            validatedItems.map((it) => [
              `${it.productId}:${it.productColorId ?? 'null'}`,
              {
                productId: it.productId,
                productColorId: it.productColorId ?? null,
              },
            ]),
          ).values(),
        );

        if (orderedCartItemConditions.length > 0) {
          await tx.cartItem.deleteMany({
            where: {
              cartId: cart.id,
              OR: orderedCartItemConditions,
            },
          });
        }
      }
    }

    await tx.orderShipping.create({
      data: {
        orderId: order.id,
        recipientName,
        recipientPhone,
        address1,
        address2,
      },
    });

    await tx.orderItem.createMany({
      data: validatedItems.map((it) => ({
        orderId: order.id,
        productId: it.productId,
        productColorId: it.productColorId,
        quantity: it.quantity,
        price: it.price,
        productName: it.productName,
        colorName: it.colorName,
      })),
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount,
    };
  });
}
