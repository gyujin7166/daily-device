import 'server-only';

import type { UserAddress } from '@entities/address/model/types';

import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '@shared/lib/errors/httpError';

import prisma from 'prisma/prismaClientSingleton';

type UpsertUserAddressBody = {
  id?: number;
  recipientName: string;
  recipientPhone: string;
  address1: string;
  address2?: string;
  isDefault?: boolean;
};

type UpsertUserAddressParams = {
  userId: string;
  id?: number;
  recipientName: string;
  recipientPhone: string;
  address1: string;
  address2?: string;
  isDefault?: boolean;
};

const isValidRecipientName = (value: string) =>
  /^[A-Za-z가-힣0-9 ]+$/.test(value.trim());

const isValidKoreanMobile = (value: string) => /^010\d{8}$/.test(value);

export async function getAddresses(userId: string): Promise<UserAddress[]> {
  const addresses = await prisma.userAddress.findMany({
    where: { userId },
    select: {
      id: true,
      recipientName: true,
      recipientPhone: true,
      address1: true,
      address2: true,
      isDefault: true,
      updatedAt: true,
    },
    orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
  });

  return addresses.map((address) => ({
    ...address,
    updatedAt: address.updatedAt.toISOString(),
  }));
}

async function upsertAddress(
  params: UpsertUserAddressParams,
): Promise<{ id: number }> {
  const {
    userId,
    id,
    recipientName,
    recipientPhone,
    address1,
    address2,
    isDefault,
  } = params;

  return prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    if (!id) {
      return tx.userAddress.create({
        data: {
          userId,
          recipientName,
          recipientPhone,
          address1,
          address2: address2 ?? null,
          isDefault: Boolean(isDefault),
        },
        select: { id: true },
      });
    }

    const target = await tx.userAddress.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!target) {
      throw new NotFoundError('Address not found');
    }

    if (target.userId !== userId) {
      throw new ForbiddenError();
    }

    await tx.userAddress.update({
      where: { id },
      data: {
        recipientName,
        recipientPhone,
        address1,
        address2: address2 ?? null,
        isDefault: Boolean(isDefault),
      },
    });

    return { id };
  });
}

export async function upsertAddressForUser(
  userId: string,
  body: UpsertUserAddressBody,
): Promise<{ id: number }> {
  const { id, recipientName, recipientPhone, address1, address2, isDefault } =
    body;

  const normalizedName = recipientName.trim();
  const normalizedPhone = recipientPhone.replace(/[^\d]/g, '');
  const normalizedAddress1 = address1.trim();
  const normalizedAddress2 = address2?.trim();

  if (!isValidRecipientName(normalizedName)) {
    throw new BadRequestError('Invalid recipient name format');
  }

  if (!isValidKoreanMobile(normalizedPhone)) {
    throw new BadRequestError('Invalid recipient phone format');
  }

  if (!normalizedAddress1) {
    throw new BadRequestError('Invalid address');
  }

  return upsertAddress({
    userId,
    id,
    recipientName: normalizedName,
    recipientPhone: normalizedPhone,
    address1: normalizedAddress1,
    address2: normalizedAddress2,
    isDefault: Boolean(isDefault),
  });
}
