import { useEffect, useRef } from 'react';

import { useMutationState } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { cartMutationKeys } from '@entities/cart/queries/queryKeys';

import { toast } from '@shared/lib/toast';

export default function CartError() {
  const t = useTranslations('Cart');
  const latestNotifiedAtRef = useRef(0);
  const failedCartMutationTimes = useMutationState({
    filters: {
      mutationKey: cartMutationKeys.addToCart(),
      status: 'error',
    },
    select: (mutation) => mutation.state.submittedAt,
  });
  const latestFailedAt = Math.max(0, ...failedCartMutationTimes);

  useEffect(() => {
    if (latestFailedAt <= latestNotifiedAtRef.current) {
      return;
    }

    latestNotifiedAtRef.current = latestFailedAt;
    toast.error(t('updateFailed'));
  }, [latestFailedAt, t]);

  return null;
}
