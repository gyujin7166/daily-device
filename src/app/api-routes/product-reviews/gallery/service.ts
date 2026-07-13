import 'server-only';

import type {
  ProductReviewGalleryImage,
  ProductReviewGalleryPageResponse,
} from '@entities/review/model/types';

import {
  getTranslationContext,
  pickTranslation,
} from '@shared/lib/i18n/translation';
import { maskEmail, maskName } from '@shared/lib/utils/mask';

import prisma from 'prisma/prismaClientSingleton';

export async function getProductReviewGalleryBySlug(
  slug: string,
  page?: number,
  limit?: number,
  currentUserId?: string,
  localeValue?: string,
): Promise<ProductReviewGalleryPageResponse> {
  const { locale, localeFallbacks } = getTranslationContext(localeValue);
  const safePage = page && page > 0 ? Math.floor(page) : 1;
  const safeLimit = limit && limit > 0 ? Math.floor(limit) : 20;
  const where = {
    productReview: {
      adminHiddenAt: null,
      product: {
        slug,
      },
    },
  };

  const [total, rawItems] = await prisma.$transaction([
    prisma.productReviewImage.count({ where }),
    prisma.productReviewImage.findMany({
      where,
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      select: {
        id: true,
        productReviewId: true,
        image_url: true,
        blur_data_url: true,
        order: true,
        productReview: {
          select: {
            id: true,
            rating: true,
            title: true,
            content: true,
            createdAt: true,
            ProductReviewImage: {
              select: {
                id: true,
                image_url: true,
                blur_data_url: true,
                order: true,
              },
              orderBy: [{ order: 'asc' }, { id: 'asc' }],
            },
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
                        translations: {
                          where: { locale: { in: localeFallbacks } },
                          select: {
                            locale: true,
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        {
          productReview: {
            createdAt: 'desc',
          },
        },
        { order: 'asc' },
        { id: 'asc' },
      ],
    }),
  ]);

  const reviewIds = [...new Set(rawItems.map((item) => item.productReviewId))];
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
  const colors = await prisma.color.findMany({
    select: {
      name: true,
      translations: {
        where: { locale: { in: localeFallbacks } },
        select: {
          locale: true,
          name: true,
        },
      },
    },
  });
  const translatedColorNameByBaseName = colors.reduce<Record<string, string>>(
    (acc, color) => {
      const translation = pickTranslation(color.translations, locale);

      if (translation?.name) {
        acc[color.name] = translation.name;
      }

      return acc;
    },
    {},
  );

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

  const items: ProductReviewGalleryImage[] = rawItems.map((item) => {
    const colorTranslation = item.productReview.orderItem.productColor
      ? pickTranslation(
          item.productReview.orderItem.productColor.color.translations,
          locale,
        )
      : undefined;
    const email = item.productReview.user.email || '';
    const name = item.productReview.user.name || '';
    const helpfulCount = helpfulCountByReviewId[item.productReview.id] ?? 0;
    const maskedUser =
      email && email.trim() !== ''
        ? maskEmail(email)
        : name && name.trim() !== ''
          ? maskName(name)
          : '';

    return {
      id: item.id,
      productReviewId: item.productReviewId,
      image_url: item.image_url,
      blur_data_url: item.blur_data_url,
      order: item.order,
      productReview: {
        id: item.productReview.id,
        rating: item.productReview.rating,
        title: item.productReview.title,
        content: item.productReview.content,
        createdAt: item.productReview.createdAt.toISOString(),
        helpfulCount,
        currentUserVote: currentUserVoteByReviewId[item.productReview.id]
          ? true
          : null,
        orderItem: {
          colorName:
            colorTranslation?.name ??
            (item.productReview.orderItem.colorName
              ? translatedColorNameByBaseName[
                  item.productReview.orderItem.colorName
                ]
              : undefined) ??
            item.productReview.orderItem.colorName ??
            item.productReview.orderItem.productColor?.color.name ??
            null,
          colorHex:
            item.productReview.orderItem.productColor?.color.hex ?? null,
        },
        reviewImages: item.productReview.ProductReviewImage.map((image) => ({
          id: image.id,
          image_url: image.image_url,
          blur_data_url: image.blur_data_url,
          order: image.order,
        })),
        user: {
          maskedUser,
        },
      },
    };
  });

  return {
    items,
    total,
    page: safePage,
    limit: safeLimit,
    hasMore: safePage * safeLimit < total,
  };
}
