import { NextResponse } from 'next/server';

import { adminHomeSectionBodySchema } from '@features/admin-home/model/schema';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';

import { revalidatePublicShopPages } from '../../revalidation';
import { adminIdParamSchema } from '../../schema';
import { assertAdminWriteAccess, updateAdminHomeSection } from '../../service';

type AdminHomeSectionRouteContext = {
  params: Promise<{ sectionId: string }>;
};

export async function PUT(
  request: Request,
  context: AdminHomeSectionRouteContext,
) {
  try {
    await assertAdminWriteAccess();
    const { sectionId } = await context.params;
    const { id } = parseWithSchema(adminIdParamSchema, { id: sectionId });
    const body = await readJsonBody(request);
    const input = parseWithSchema(adminHomeSectionBodySchema, body);
    const section = await updateAdminHomeSection(id, input);
    revalidatePublicShopPages();
    return NextResponse.json(
      { items: section, message: API_MESSAGE.SUCCESS },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[PUT /api/admin/home-sections/:sectionId] failed:',
    });
  }
}
