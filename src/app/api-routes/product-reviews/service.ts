import 'server-only';

import { ReviewStatus } from '@prisma/client';

import type { ProductReviewFilter } from '@entities/review/model/filter';
import type { ProductReviewSortOption } from '@entities/review/model/sort';
import type {
  ProductReviewListItem,
  ProductReviewsPayload,
} from '@entities/review/model/types';

import { ConflictError } from '@shared/lib/errors/httpError';
import { createBlurDataUrl } from '@shared/lib/image/createBlurDataUrl';
import { maskEmail, maskName } from '@shared/lib/utils/mask';

import prisma from 'prisma/prismaClientSingleton';

import type { Prisma } from '@prisma/client';
import type {
  ProductReview as PrismaProductReview,
  ProductReviewImage as PrismaProductReviewImage,
} from '@prisma/client';

const getProductReviewOrderBy = (
  sort: ProductReviewSortOption,
): Prisma.ProductReviewOrderByWithRelationInput[] => {
  if (sort === 'oldest') {
    return [{ createdAt: 'asc' }];
  }

  if (sort === 'rating_desc') {
    return [{ rating: 'desc' }, { createdAt: 'desc' }];
  }

  if (sort === 'rating_asc') {
    return [{ rating: 'asc' }, { createdAt: 'desc' }];
  }

  return [{ createdAt: 'desc' }];
};

export async function getProductReviewsBySlug(
  slug: string,
  page: number,
  perPage: number,
  sort: ProductReviewSortOption,
  filter: ProductReviewFilter = 'all',
  currentUserId?: string,
): Promise<ProductReviewsPayload> {
  const skip = (page - 1) * perPage;
  const orderBy = getProductReviewOrderBy(sort);

  const baseReviewWhere = {
    adminHiddenAt: null,
    product: {
      slug,
    },
  } satisfies Prisma.ProductReviewWhereInput;

  const listReviewWhere = {
    ...baseReviewWhere,
    ...(filter === 'with_images' ? { ProductReviewImage: { some: {} } } : {}),
  } satisfies Prisma.ProductReviewWhereInput;

  const [
    totalItems,
    summaryTotalItems,
    totalReviewImageCount,
    ratingAggregate,
    ratingGroups,
    productReview,
  ] = await Promise.all([
    prisma.productReview.count({
      where: listReviewWhere,
    }),
    prisma.productReview.count({
      where: baseReviewWhere,
    }),
    prisma.productReviewImage.count({
      where: {
        productReview: {
          adminHiddenAt: null,
          product: {
            slug,
          },
        },
      },
    }),
    prisma.productReview.aggregate({
      where: baseReviewWhere,
      _avg: {
        rating: true,
      },
    }),
    prisma.productReview.groupBy({
      by: ['rating'],
      where: baseReviewWhere,
      _count: {
        rating: true,
      },
    }),
    prisma.productReview.findMany({
      where: listReviewWhere,
      select: {
        id: true,
        productId: true,
        rating: true,
        title: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        orderItem: {
          select: {
            colorName: true,
            productColor: {
              select: {
                color: {
                  select: {
                    name: true,
                    hex: true,
                  },
                },
              },
            },
          },
        },
        ProductReviewImage: {
          select: {
            id: true,
            image_url: true,
            blur_data_url: true,
            order: true,
          },
        },
      },
      orderBy,
      skip,
      take: perPage,
    }),
  ]);
  const reviewIds = productReview.map((review) => review.id);
  let feedbackGroups: {
    productReviewId: number;
    _count: {
      productReviewId: number;
    };
  }[] = [];
  let currentUserFeedbacks: {
    productReviewId: number;
  }[] = [];

  if (reviewIds.length > 0) {
    [feedbackGroups, currentUserFeedbacks] = await Promise.all([
      prisma.productReviewFeedback.groupBy({
        by: ['productReviewId'],
        where: {
          productReviewId: {
            in: reviewIds,
          },
          isHelpful: true,
        },
        _count: {
          productReviewId: true,
        },
      }),
      currentUserId
        ? prisma.productReviewFeedback.findMany({
            where: {
              productReviewId: {
                in: reviewIds,
              },
              userId: currentUserId,
              isHelpful: true,
            },
            select: {
              productReviewId: true,
            },
          })
        : Promise.resolve([]),
    ]);
  }

  const helpfulCountByReviewId = feedbackGroups.reduce<Record<number, number>>(
    (acc, group) => {
      acc[group.productReviewId] = group._count.productReviewId;
      return acc;
    },
    {},
  );
  const currentUserVoteByReviewId = currentUserFeedbacks.reduce<
    Record<number, true>
  >((acc, feedback) => {
    acc[feedback.productReviewId] = true;
    return acc;
  }, {});

  const maskedReview: ProductReviewListItem[] = productReview.map((review) => {
    const { orderItem, ...reviewData } = review;
    const email = review.user.email || '';
    const name = review.user.name || '';
    const helpfulCount = helpfulCountByReviewId[review.id] ?? 0;

    const maskedUser =
      email && email.trim() !== ''
        ? maskEmail(email)
        : name && name.trim() !== ''
          ? maskName(name)
          : '익명';

    return {
      ...reviewData,
      createdAt: review.createdAt.toISOString(),
      user: {
        maskedUser,
      },
      orderItem: {
        colorName:
          orderItem.colorName ?? orderItem.productColor?.color.name ?? null,
        colorHex: orderItem.productColor?.color.hex ?? null,
      },
      helpfulCount,
      currentUserVote: currentUserVoteByReviewId[review.id] ? true : null,
    };
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const averageRating =
    Math.round((ratingAggregate._avg.rating ?? 0) * 10) / 10;
  const ratingCountByScore = ratingGroups.reduce<Record<number, number>>(
    (acc, cur) => {
      acc[cur.rating] = cur._count.rating;
      return acc;
    },
    {},
  );
  const ratingCounts = [5, 4, 3, 2, 1].map(
    (score) => ratingCountByScore[score] ?? 0,
  );

  return {
    items: maskedReview,
    totalItems,
    summaryTotalItems,
    totalReviewImageCount,
    averageRating,
    ratingCounts,
    totalPages,
    currentPage: page,
    perPage,
  };
}

type UpsertReviewItem = Omit<PrismaProductReview, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

type UpsertReviewParams = {
  userId: string;
  productId: number;
  orderItemId: number;
  rating: number;
  title: string;
  content: string;
  images: Array<
    Pick<PrismaProductReviewImage, 'image_url' | 'order'> & {
      blur_data_url?: string | null;
    }
  >;
};

export async function findReviewableOrderItem(
  userId: string,
  orderItemId: number,
): Promise<{
  id: number;
  productId: number;
  hiddenReviewId: number | null;
} | null> {
  return prisma.orderItem
    .findFirst({
      where: {
        id: orderItemId,
        order: {
          userId,
        },
      },
      select: {
        id: true,
        productId: true,
        ProductReview: {
          where: {
            userId,
            adminHiddenAt: { not: null },
          },
          select: {
            id: true,
          },
          take: 1,
        },
      },
    })
    .then((orderItem) =>
      orderItem
        ? {
            id: orderItem.id,
            productId: orderItem.productId,
            hiddenReviewId: orderItem.ProductReview[0]?.id ?? null,
          }
        : null,
    );
}

export async function upsertReviewForUser(
  params: UpsertReviewParams,
): Promise<UpsertReviewItem> {
  const { userId, productId, orderItemId, rating, title, content, images } =
    params;
  const imagesWithBlurDataUrl = await Promise.all(
    images.map(async (image) => ({
      ...image,
      blur_data_url:
        image.blur_data_url ?? (await createBlurDataUrl(image.image_url)),
    })),
  );

  return prisma.$transaction(async (tx) => {
    const hiddenReview = await tx.productReview.findFirst({
      where: {
        userId,
        orderItemId,
        adminHiddenAt: { not: null },
      },
      select: { id: true },
    });

    if (hiddenReview) {
      throw new ConflictError(
        '관리자에 의해 비공개 처리된 상품평은 수정할 수 없습니다.',
      );
    }

    const review = await tx.productReview.upsert({
      where: {
        userId_orderItemId: {
          userId,
          orderItemId,
        },
      },
      update: {
        rating,
        title,
        content,
        updatedAt: new Date(),
      },
      create: {
        userId,
        productId,
        orderItemId,
        rating,
        title,
        content,
      },
    });

    await tx.productReviewImage.deleteMany({
      where: { productReviewId: review.id },
    });

    if (imagesWithBlurDataUrl.length > 0) {
      await tx.productReviewImage.createMany({
        data: imagesWithBlurDataUrl.map((img) => ({
          image_url: img.image_url,
          blur_data_url: img.blur_data_url,
          order: img.order,
          productReviewId: review.id,
        })),
      });
    }

    await tx.orderItem.update({
      where: { id: orderItemId },
      data: { reviewStatus: ReviewStatus.COMPLETED },
    });

    return {
      ...review,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  });
}
