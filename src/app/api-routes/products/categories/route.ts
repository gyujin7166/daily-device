import { NextResponse } from 'next/server';

import type { CategoryItems } from '@entities/category/model/types';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import type { ApiResponse } from '@shared/types/api';

import { getCategoryList } from './service';

export async function GET() {
  try {
    const category = await getCategoryList();
    const response: ApiResponse<CategoryItems[]> = {
      items: category,
      message: API_MESSAGE.SUCCESS,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[GET /api/products/categories] failed:',
    });
  }
}
