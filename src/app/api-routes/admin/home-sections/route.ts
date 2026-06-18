import { NextResponse } from 'next/server';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';

import { assertAdminReadAccess, getAdminHomeSections } from '../service';

export async function GET() {
  try {
    await assertAdminReadAccess();
    const data = await getAdminHomeSections();
    return NextResponse.json(
      { items: data, message: API_MESSAGE.SUCCESS },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[GET /api/admin/home-sections] failed:',
    });
  }
}
