import 'server-only';

import { randomUUID } from 'crypto';

import prisma from 'prisma/prismaClientSingleton';

const DEMO_USER_EMAIL =
  process.env.DEMO_USER_EMAIL ?? 'demo@daily-device.local';
const DEMO_USER_NAME = process.env.DEMO_USER_NAME ?? 'Demo User';

export const SESSION_MAX_AGE_SECONDS = 1 * 24 * 60 * 60;

export async function getOrCreateDemoUser() {
  const normalizedEmail = DEMO_USER_EMAIL.trim().toLowerCase();
  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: DEMO_USER_NAME,
      },
    });
  }

  const existingCart = await prisma.cart.findFirst({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!existingCart) {
    await prisma.cart.create({ data: { userId: user.id } });
  }

  return user;
}

export async function createDemoSession(userId: string) {
  const sessionToken = `demo-${randomUUID()}-${randomUUID()}`;
  const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const now = new Date();

  await prisma.$transaction([
    prisma.session.create({
      data: {
        sessionToken,
        userId,
        expires,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: now },
    }),
    prisma.loginHistory.create({
      data: {
        userId,
        provider: 'demo-login',
        createdAt: now,
      },
    }),
  ]);

  return {
    sessionToken,
    expires,
  };
}
