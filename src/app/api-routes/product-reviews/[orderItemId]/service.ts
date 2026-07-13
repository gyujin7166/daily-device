import 'server-only';

import type { ProductReviewEditItem } from '@entities/review/model/types';

import { PRODUCT_REVIEW_ERROR_CODE } from '@shared/constants/productReviewErrorCode';
import { ForbiddenError } from '@shared/lib/errors/httpError';

import prisma from 'prisma/prismaClientSingleton';

export async function getProductReviewByOrderItem(
  userId: string,
  orderItemId: number,
): Promise<ProductReviewEditItem | null> {
  const review = await prisma.productReview.findUnique({
    where: {
      userId_orderItemId: {
        userId,
        orderItemId,
      },
    },
    select: {
      id: true,
      productId: true,
      rating: true,
      title: true,
      content: true,
      adminHiddenAt: true,
      ProductReviewImage: {
        select: {
          image_url: true,
          blur_data_url: true,
          order: true,
        },
      },
    },
  });

  if (review?.adminHiddenAt) {
    throw new ForbiddenError(
      '관리자에 의해 비공개 처리된 상품평은 수정할 수 없습니다.',
      PRODUCT_REVIEW_ERROR_CODE.HIDDEN_REVIEW_EDIT_FORBIDDEN,
    );
  }

  if (!review) {
    return null;
  }

  return {
    ...review,
    adminHiddenAt: null,
  };
}
