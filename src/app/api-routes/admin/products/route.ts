import { NextResponse } from 'next/server';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';

import { adminProductBodySchema, adminProductQuerySchema } from '../schemas';
import {
  assertAdminReadAccess,
  assertAdminWriteAccess,
  createAdminProduct,
  getAdminProducts,
} from '../service';

export async function GET(request: Request) {
  try {
    await assertAdminReadAccess();
    const url = new URL(request.url);
    const query = parseWithSchema(adminProductQuerySchema, {
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit'),
      keyword: url.searchParams.get('keyword'),
      categoryId: url.searchParams.get('categoryId'),
    });
    const data = await getAdminProducts(query);
    return NextResponse.json(
      { items: data, message: API_MESSAGE.SUCCESS },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[GET /api/admin/products] failed:',
    });
  }
}

export async function POST(request: Request) {
  try {
    await assertAdminWriteAccess();
    const body = await readJsonBody(request);
    const input = parseWithSchema(adminProductBodySchema, body);
    const product = await createAdminProduct(input);

    return NextResponse.json(
      { items: product, message: API_MESSAGE.SUCCESS },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[POST /api/admin/products] failed:',
    });
  }
}
