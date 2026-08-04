import { NextResponse } from 'next/server';

import { adminHeroBodySchema } from '@features/admin-hero/model/schema';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';

import { revalidatePublicShopPages } from '../revalidation';
import {
  assertAdminReadAccess,
  assertAdminWriteAccess,
  createAdminHero,
  getAdminHeroes,
} from '../service';

export async function GET() {
  try {
    await assertAdminReadAccess();
    const data = await getAdminHeroes();
    return NextResponse.json(
      { items: data, message: API_MESSAGE.SUCCESS },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[GET /api/admin/heroes] failed:',
    });
  }
}

export async function POST(request: Request) {
  try {
    await assertAdminWriteAccess();
    const body = await readJsonBody(request);
    const input = parseWithSchema(adminHeroBodySchema, body);
    const hero = await createAdminHero(input);
    revalidatePublicShopPages();

    return NextResponse.json(
      { items: hero, message: API_MESSAGE.SUCCESS },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[POST /api/admin/heroes] failed:',
    });
  }
}
