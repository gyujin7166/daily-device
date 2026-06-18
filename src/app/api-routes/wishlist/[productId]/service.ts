import 'server-only';

import prisma from 'prisma/prismaClientSingleton';

import type { Prisma } from '@prisma/client';

export async function deleteWishlistItemByProduct(
  userId: string,
  productId: number,
): Promise<Prisma.BatchPayload> {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!wishlist) {
    return { count: 0 };
  }

  return prisma.wishlistItem.deleteMany({
    where: {
      wishlistId: wishlist.id,
      productId,
    },
  });
}
