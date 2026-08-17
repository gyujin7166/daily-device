import type { ReactNode } from 'react';

import { useCheckoutStore } from '../../model/store/checkoutStore';

type CheckoutFlowShippingColumnProps = {
  children: ReactNode;
};

export default function CheckoutFlowShippingColumn({
  children,
}: CheckoutFlowShippingColumnProps) {
  const isAddressModalOpen = useCheckoutStore(
    (state) => state.isAddressModalOpen,
  );
  const className = `grid gap-y-5 xl:sticky xl:top-10 xl:gap-y-6 xl:self-start ${
    isAddressModalOpen ? 'xl:z-150' : 'xl:z-10'
  }`;

  return <div className={className}>{children}</div>;
}
