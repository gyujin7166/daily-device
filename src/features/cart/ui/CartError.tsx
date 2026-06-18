import { useEffect, useRef } from 'react';

import { useMutationState } from '@tanstack/react-query';

import { cartMutationKeys } from '@entities/cart/queries/queryKeys';

import { toast } from '@shared/lib/toast';

export default function CartError() {
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
    toast.error(
      '장바구니를 업데이트하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    );
  }, [latestFailedAt]);

  return null;
}
