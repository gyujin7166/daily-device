import { useOrders } from '@entities/order/queries/useOrders';

import CheckoutOrderCompleteEmptyState from './CheckoutOrderCompleteEmptyState';
import CheckoutOrderCompleteFooter from './CheckoutOrderCompleteFooter';
import CheckoutOrderCompleteHeader from './CheckoutOrderCompleteHeader';
import CheckoutOrderCompleteLoadingState from './CheckoutOrderCompleteLoadingState';
import OrderCompleteItemCard from './OrderCompleteItemCard';

type CheckoutOrderCompleteProps = {
  orderNumber: string;
};

export default function CheckoutOrderComplete({
  orderNumber,
}: CheckoutOrderCompleteProps) {
  const { data: orders, isPending, isFetching } = useOrders();

  const order = orders?.find((item) => item.orderNumber === orderNumber);
  const isOrderLoading = isPending || (isFetching && !order);

  if (isOrderLoading) {
    return <CheckoutOrderCompleteLoadingState />;
  }

  if (!order) {
    return <CheckoutOrderCompleteEmptyState />;
  }

  const totalPrice = order.orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lg dark:border-dark-border dark:bg-dark-panel">
      <CheckoutOrderCompleteHeader
        orderNumber={order.orderNumber}
        createdAt={order.createdAt}
      />

      <div className="p-8">
        <div className="space-y-6">
          {order.orderItems.map((item, index) => (
            <OrderCompleteItemCard
              key={item.id}
              item={item}
              isLast={index === order.orderItems.length - 1}
            />
          ))}
        </div>

        <CheckoutOrderCompleteFooter
          orderNumber={order.orderNumber}
          totalPrice={totalPrice}
        />
      </div>
    </section>
  );
}
