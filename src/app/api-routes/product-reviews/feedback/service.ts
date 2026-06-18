import 'server-only';

import type { ProductReviewFeedbackSummary } from '@entities/review/model/types';

import { NotFoundError } from '@shared/lib/errors/httpError';

import prisma from 'prisma/prismaClientSingleton';

export async function upsertProductReviewFeedbackByUser(
  userId: string,
  productReviewId: number,
): Promise<ProductReviewFeedbackSummary> {
  return prisma.$transaction(async (tx) => {
    const review = await tx.productReview.findUnique({
      where: {
        id: productReviewId,
      },
      select: {
        id: true,
      },
    });

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    const compoundWhere = {
      productReviewId_userId: {
        productReviewId,
        userId,
      },
    };
    const existingFeedback = await tx.productReviewFeedback.findUnique({
      where: compoundWhere,
      select: {
        id: true,
        isHelpful: true,
      },
    });

    let currentUserVote: boolean | null = true;

    if (existingFeedback?.isHelpful === true) {
      await tx.productReviewFeedback.delete({
        where: compoundWhere,
      });
      currentUserVote = null;
    } else if (existingFeedback) {
      await tx.productReviewFeedback.update({
        where: compoundWhere,
        data: {
          isHelpful: true,
        },
      });
    } else {
      await tx.productReviewFeedback.create({
        data: {
          productReviewId,
          userId,
          isHelpful: true,
        },
      });
    }

    const helpfulCount = await tx.productReviewFeedback.count({
      where: {
        productReviewId,
        isHelpful: true,
      },
    });

    return {
      productReviewId,
      helpfulCount,
      currentUserVote,
    };
  });
}
