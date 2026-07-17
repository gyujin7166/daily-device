import { NextResponse } from 'next/server';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';

import { revalidatePublicShopPages } from '../../revalidation';
import { adminHeroBodySchema, adminIdParamSchema } from '../../schemas';
import {
  assertAdminWriteAccess,
  deleteAdminHero,
  updateAdminHero,
} from '../../service';

type AdminHeroRouteContext = {
  params: Promise<{ heroId: string }>;
};

export async function PUT(request: Request, context: AdminHeroRouteContext) {
  try {
    await assertAdminWriteAccess();
    const { heroId } = await context.params;
    const { id } = parseWithSchema(adminIdParamSchema, { id: heroId });
    const body = await readJsonBody(request);
    const input = parseWithSchema(adminHeroBodySchema, body);
    const hero = await updateAdminHero(id, input);
    revalidatePublicShopPages();
    return NextResponse.json(
      { items: hero, message: API_MESSAGE.SUCCESS },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[PUT /api/admin/heroes/:heroId] failed:',
    });
  }
}

export async function DELETE(
  _request: Request,
  context: AdminHeroRouteContext,
) {
  try {
    await assertAdminWriteAccess();
    const { heroId } = await context.params;
    const { id } = parseWithSchema(adminIdParamSchema, { id: heroId });
    await deleteAdminHero(id);
    revalidatePublicShopPages();

    return NextResponse.json(
      { items: { id }, message: API_MESSAGE.SUCCESS },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[DELETE /api/admin/heroes/:heroId] failed:',
    });
  }
}
