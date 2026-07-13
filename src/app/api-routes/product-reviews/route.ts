import { NextResponse } from 'next/server';

import { z } from 'zod';

import {
  MAX_REVIEW_IMAGES,
  PRODUCT_REVIEW_PER_PAGE,
} from '@entities/review/model/constants';
import type { ProductReviewFilter } from '@entities/review/model/filter';
import type { ProductReviewSortOption } from '@entities/review/model/sort';
import type { ProductReviewsPayload } from '@entities/review/model/types';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { PRODUCT_REVIEW_ERROR_CODE } from '@shared/constants/productReviewErrorCode';
import { getRequiredUserId } from '@shared/lib/api/getRequiredUserId';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';
import { ConflictError, ForbiddenError } from '@shared/lib/errors/httpError';
import type { ApiResponse } from '@shared/types/api';

import { auth } from 'auth';

import {
  findReviewableOrderItem,
  getProductReviewsBySlug,
  upsertReviewForUser,
} from './service';

const getProductReviewsQuerySchema = z.object({
  slug: z.string().trim().min(1),
  page: z.coerce.number().int().positive().default(1),
  sort: z
    .enum(['latest', 'oldest', 'rating_desc', 'rating_asc'])
    .default('latest'),
  filter: z.enum(['all', 'with_images']).default('all'),
  locale: z.string().trim().optional(),
});

const upsertReviewImageSchema = z.object({
  image_url: z.string().trim().min(1),
  order: z.coerce.number().int().nonnegative(),
});

const upsertReviewBodySchema = z.object({
  orderItemId: z.coerce.number().int().positive(),
  rating: z.coerce.number().min(1).max(5),
  title: z.string().default(''),
  content: z.string().default(''),
  images: z.array(upsertReviewImageSchema).max(MAX_REVIEW_IMAGES).default([]),
});

type GetData = ApiResponse<ProductReviewsPayload>;
type PostData = ApiResponse<Awaited<ReturnType<typeof upsertReviewForUser>>>;

export async function GET(request: Request) {
  try {
    const session = await auth();
    const url = new URL(request.url);
    const {
      slug,
      page: pageNum,
      sort,
      filter,
      locale,
    } = parseWithSchema(
      getProductReviewsQuerySchema,
      {
        slug: url.searchParams.get('slug') ?? url.searchParams.get('name_en'),
        page: url.searchParams.get('page') ?? '1',
        sort: url.searchParams.get('sort') ?? 'latest',
        filter: url.searchParams.get('filter') ?? 'all',
        locale: url.searchParams.get('locale') ?? undefined,
      },
      'slug query parameter is required',
    );
    const perPageNum = PRODUCT_REVIEW_PER_PAGE;
    const sortOption: ProductReviewSortOption = sort;
    const reviewFilter: ProductReviewFilter = filter;

    const result = await getProductReviewsBySlug(
      slug,
      pageNum,
      perPageNum,
      sortOption,
      reviewFilter,
      session?.user?.id ?? undefined,
      locale,
    );
    const response: GetData = { items: result, message: API_MESSAGE.SUCCESS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId();
    const body = await readJsonBody(request);
    const { orderItemId, rating, title, content, images } = parseWithSchema(
      upsertReviewBodySchema,
      body,
    );

    const orderItem = await findReviewableOrderItem(userId, orderItemId);

    if (!orderItem) {
      throw new ForbiddenError();
    }

    if (orderItem.hiddenReviewId) {
      throw new ConflictError(
        '관리자에 의해 비공개 처리된 상품평은 수정할 수 없습니다.',
        PRODUCT_REVIEW_ERROR_CODE.HIDDEN_REVIEW_EDIT_FORBIDDEN,
      );
    }

    const review = await upsertReviewForUser({
      userId,
      productId: orderItem.productId,
      orderItemId,
      rating,
      title,
      content,
      images,
    });

    const response: PostData = { items: review, message: API_MESSAGE.SUCCESS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: 'upsert-review error:',
    });
  }
}
