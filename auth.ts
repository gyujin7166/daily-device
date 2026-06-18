import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';
import NaverProvider from 'next-auth/providers/naver';

import prisma from 'prisma/prismaClientSingleton';

import type { NextAuthConfig } from 'next-auth';

const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL ?? 'demo@ecommerce.local';
const AUTH_SESSION_PROVIDER_CACHE_TTL_MS = 60 * 1000;
const isAuthDebugEnabled = process.env.AUTH_DEBUG === 'true';
const sessionProviderCache = new Map<
  string,
  {
    provider: string | null;
    expiresAt: number;
  }
>();

const getCachedSessionProvider = (
  userId: string,
): string | undefined | null => {
  const cached = sessionProviderCache.get(userId);

  if (!cached) {
    return undefined;
  }

  if (cached.expiresAt <= Date.now()) {
    sessionProviderCache.delete(userId);
    return undefined;
  }

  return cached.provider;
};

const setCachedSessionProvider = (userId: string, provider: string | null) => {
  sessionProviderCache.set(userId, {
    provider,
    expiresAt: Date.now() + AUTH_SESSION_PROVIDER_CACHE_TTL_MS,
  });
};

const authConfig = {
  adapter: PrismaAdapter(prisma),
  debug: isAuthDebugEnabled,
  ...(isAuthDebugEnabled
    ? {
        logger: {
          error(error: Error) {
            console.error('[auth][error]', error);
          },
          warn(message: string) {
            console.warn('[auth][warn]', message);
          },
          debug(message: string) {
            console.debug('[auth][debug]', message);
          },
        },
      }
    : {}),
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
      authorization: {
        params: { prompt: 'select_account' },
      },
    }),
    NaverProvider({
      clientId: process.env.AUTH_NAVER_ID as string,
      clientSecret: process.env.AUTH_NAVER_SECRET as string,
      authorization: {
        url: 'https://nid.naver.com/oauth2.0/authorize',
        params: {
          auth_type: 'reauthenticate',
        },
      },
      profile(profile) {
        const response = profile.response;

        return {
          id: response.id,
          name: response.nickname || response.name || null,
          email: response.email,
          image: response.profile_image,
        };
      },
    }),
    KakaoProvider({
      clientId: process.env.AUTH_KAKAO_ID as string,
      clientSecret: process.env.AUTH_KAKAO_SECRET as string,
      authorization: {
        url: 'https://kauth.kakao.com/oauth/authorize?scope=',
        params: { prompt: 'login' },
      },
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 1 * 24 * 60 * 60,
  },
  callbacks: {
    async session({ session, user }) {
      const sessionUserId = user?.id ?? null;
      const normalizedUserEmail = user?.email?.trim().toLowerCase() ?? null;
      const normalizedDemoEmail = DEMO_USER_EMAIL.trim().toLowerCase();

      session.user.id = sessionUserId;

      if (!sessionUserId) {
        session.user.provider = null;
        return session;
      }

      if (normalizedUserEmail === normalizedDemoEmail) {
        session.user.provider = 'demo-login';
        return session;
      }

      const cachedProvider = getCachedSessionProvider(sessionUserId);
      let resolvedProvider = cachedProvider;

      if (typeof resolvedProvider === 'undefined') {
        const account = await prisma.account.findFirst({
          where: { userId: sessionUserId },
          orderBy: { id: 'desc' },
          select: { provider: true },
        });

        resolvedProvider = account?.provider ?? null;
        setCachedSessionProvider(sessionUserId, resolvedProvider);
      }

      session.user.provider = resolvedProvider;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (!url) {
        return baseUrl;
      }

      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      try {
        if (new URL(url).origin === baseUrl) {
          return url;
        }
      } catch (error) {
        console.warn('[auth][redirect-invalid-url]', { url, error });
      }

      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) {
        return;
      }

      await prisma.cart.create({ data: { userId: user.id } });
    },
  },
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig;

export const { handlers, auth } = NextAuth(authConfig);
