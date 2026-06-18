import type { UserCartItem } from '@entities/cart/model/types';

import CheckoutSection from '../common/CheckoutSection';
import CheckoutOrderItems from '../order/CheckoutOrderItems';
import CheckoutSummary from '../order/CheckoutSummary';

type CheckoutFlowOrderItemsSectionProps = {
  totalQuantity: number;
  checkoutItems: UserCartItem[];
  checkoutTotalPrice: number;
  isBuyNowRequested: boolean;
};

export default function CheckoutFlowOrderItemsSection({
  totalQuantity,
  checkoutItems,
  checkoutTotalPrice,
  isBuyNowRequested,
}: CheckoutFlowOrderItemsSectionProps) {
  return (
    <CheckoutSection title={`주문 상품 (${totalQuantity})`}>
      <div className="grid gap-6">
        <CheckoutOrderItems items={checkoutItems} />
        <div className="border-t border-line pt-6 dark:border-dark-border">
          <h3 className="text-sm font-bold leading-4.5 uppercase lg:text-base lg:leading-5">
            주문 요약
          </h3>
          <div className="mt-4">
            <CheckoutSummary
              items={checkoutItems}
              totalPrice={checkoutTotalPrice}
              disableCartSyncEffects={isBuyNowRequested}
            />
          </div>
        </div>
      </div>
    </CheckoutSection>
  );
}
