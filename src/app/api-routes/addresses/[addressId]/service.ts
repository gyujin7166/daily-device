import 'server-only';

import { ForbiddenError, NotFoundError } from '@shared/lib/errors/httpError';

import prisma from 'prisma/prismaClientSingleton';

type DeleteAddressResult = {
  deletedId: number;
  newDefaultId?: number;
};

export async function deleteAddressWithFallback(
  userId: string,
  addressId: number,
): Promise<DeleteAddressResult> {
  return prisma.$transaction(async (tx) => {
    const target = await tx.userAddress.findUnique({
      where: { id: addressId },
      select: { id: true, isDefault: true, userId: true },
    });

    if (!target) {
      throw new NotFoundError('Address not found');
    }

    if (target.userId !== userId) {
      throw new ForbiddenError();
    }

    await tx.userAddress.delete({ where: { id: addressId } });

    if (!target.isDefault) {
      return { deletedId: addressId };
    }

    const fallback = await tx.userAddress.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true },
    });

    if (!fallback) {
      return { deletedId: addressId };
    }

    await tx.userAddress.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    await tx.userAddress.update({
      where: { id: fallback.id },
      data: { isDefault: true },
    });

    return { deletedId: addressId, newDefaultId: fallback.id };
  });
}
