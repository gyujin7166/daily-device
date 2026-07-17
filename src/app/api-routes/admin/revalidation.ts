import 'server-only';

import { revalidatePath } from 'next/cache';

export function revalidatePublicShopPages() {
  revalidatePath('/[locale]/(shop)', 'layout');
}
