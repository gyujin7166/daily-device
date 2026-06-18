import 'server-only';

import type { DeleteCartParams } from '@app/api-routes/cart/service';
import { deleteCartItems } from '@app/api-routes/cart/service';

import type { Prisma } from '@prisma/client';

export async function deleteCartItemsByRoute(
  params: DeleteCartParams,
): Promise<Prisma.BatchPayload> {
  return deleteCartItems(params);
}
