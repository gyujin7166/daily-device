import { NextResponse } from 'next/server';

import { adminHomeSectionItemBodySchema } from '@features/admin-home/model/schema';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';

import { revalidatePublicShopPages } from '../../revalidation';
import { adminIdParamSchema } from '../../schema';
import {
  assertAdminWriteAccess,
  updateAdminHomeSectionItem,
} from '../../service';

type AdminHomeSectionItemRouteContext = {
  params: Promise<{ itemId: string }>;
};

export async function PUT(
  request: Request,
  context: AdminHomeSectionItemRouteContext,
) {
  try {
    await assertAdminWriteAccess();
    const { itemId } = await context.params;
    const { id } = parseWithSchema(adminIdParamSchema, { id: itemId });
    const body = await readJsonBody(request);
    const input = parseWithSchema(adminHomeSectionItemBodySchema, body);
    const item = await updateAdminHomeSectionItem(id, input);
    revalidatePublicShopPages();
    return NextResponse.json(
      { items: item, message: API_MESSAGE.SUCCESS },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[PUT /api/admin/home-section-items/:itemId] failed:',
    });
  }
}
