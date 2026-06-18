import { NextResponse } from 'next/server';

import { z } from 'zod';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';
import type { ApiResponse } from '@shared/types/api';

import {
  createDemoSession,
  getOrCreateDemoUser,
  SESSION_MAX_AGE_SECONDS,
} from './service';

const demoLoginBodySchema = z.object({
  callbackUrl: z.string().optional(),
});

type Data = ApiResponse<{ url: string }>;

const isSecureCookie = () => {
  const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? '';
  return authUrl.startsWith('https://') || process.env.VERCEL === '1';
};

const getSessionCookieName = () => {
  return isSecureCookie()
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token';
};

const getSafeCallbackUrl = (rawCallbackUrl: unknown) => {
  if (typeof rawCallbackUrl !== 'string') {
    return '/products';
  }

  const trimmed = rawCallbackUrl.trim();
  if (!trimmed) {
    return '/products';
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return '/products';
};

const createSessionCookie = (sessionToken: string, expires: Date) => {
  const secure = isSecureCookie();
  const cookieName = getSessionCookieName();
  const expiresUtc = expires.toUTCString();
  const securePart = secure ? '; Secure' : '';

  return `${cookieName}=${encodeURIComponent(
    sessionToken,
  )}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresUtc}; Max-Age=${SESSION_MAX_AGE_SECONDS}${securePart}`;
};

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const payload = parseWithSchema(demoLoginBodySchema, body);

    const user = await getOrCreateDemoUser();
    const { sessionToken, expires } = await createDemoSession(user.id);

    const responseBody: Data = {
      items: { url: getSafeCallbackUrl(payload.callbackUrl) },
      message: API_MESSAGE.SUCCESS,
    };
    const response = NextResponse.json(responseBody, { status: 200 });
    response.headers.append(
      'Set-Cookie',
      createSessionCookie(sessionToken, expires),
    );
    return response;
  } catch (error) {
    return handleRouteError(error, {
      fallbackMessage: 'Demo login failed. Please try again.',
      logMessage: 'Demo login failed',
    });
  }
}
