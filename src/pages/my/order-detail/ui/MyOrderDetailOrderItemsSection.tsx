import { IconPackage } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { OrderItem } from '@entities/order/model/types';

import MyOrderDetailOrderItemCard from './OrderDetailItemCard';

type MyOrderDetailOrderItemsSectionProps = {
  orderItems: OrderItem[];
};

export default function MyOrderDetailOrderItemsSection({
  orderItems,
}: MyOrderDetailOrderItemsSectionProps) {
  const t = useTranslations('MyOrderDetail.labels');

  return (
    <section>
      <h2 className="mb-4 inline-flex items-center gap-2 text-lg font-semibold text-ink dark:text-surface">
        <IconPackage size={18} className="text-primary" />
        {t('orderItems')}
      </h2>
      <div className="space-y-5">
        {orderItems.map((item, index) => (
          <MyOrderDetailOrderItemCard
            key={item.id}
            item={item}
            isLastItem={index === orderItems.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
