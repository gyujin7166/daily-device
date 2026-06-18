import { NextResponse } from 'next/server';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';

import { adminHomeSectionItemCreateBodySchema } from '../schemas';
import { assertAdminWriteAccess, createAdminHomeSectionItem } from '../service';

export async function POST(request: Request) {
  try {
    await assertAdminWriteAccess();
    const body = await readJsonBody(request);
    const input = parseWithSchema(adminHomeSectionItemCreateBodySchema, body);
    const item = await createAdminHomeSectionItem(input);

    return NextResponse.json(
      { items: item, message: API_MESSAGE.SUCCESS },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[POST /api/admin/home-section-items] failed:',
    });
  }
}
