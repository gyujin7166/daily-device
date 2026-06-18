import { NextResponse } from 'next/server';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';

import { adminIdParamSchema, adminProductBodySchema } from '../../schemas';
import {
  assertAdminWriteAccess,
  deleteAdminProduct,
  updateAdminProduct,
} from '../../service';

type AdminProductRouteContext = {
  params: Promise<{ productId: string }>;
};

export async function PUT(request: Request, context: AdminProductRouteContext) {
  try {
    await assertAdminWriteAccess();
    const { productId } = await context.params;
    const { id } = parseWithSchema(adminIdParamSchema, { id: productId });
    const body = await readJsonBody(request);
    const input = parseWithSchema(adminProductBodySchema, body);
    const product = await updateAdminProduct(id, input);
    return NextResponse.json(
      { items: product, message: API_MESSAGE.SUCCESS },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[PUT /api/admin/products/:productId] failed:',
    });
  }
}

export async function DELETE(
  _request: Request,
  context: AdminProductRouteContext,
) {
  try {
    await assertAdminWriteAccess();
    const { productId } = await context.params;
    const { id } = parseWithSchema(adminIdParamSchema, { id: productId });
    await deleteAdminProduct(id);

    return NextResponse.json(
      { items: { id }, message: API_MESSAGE.SUCCESS },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[DELETE /api/admin/products/:productId] failed:',
    });
  }
}
