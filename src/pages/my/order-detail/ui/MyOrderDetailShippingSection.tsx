import {
  IconMapPin,
  IconPackageExport,
  IconPhone,
  IconUser,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { OrderResponse } from '@entities/order/model/types';

type MyOrderDetailShippingSectionProps = {
  shipping: OrderResponse['orderShipping'];
};

export default function MyOrderDetailShippingSection({
  shipping,
}: MyOrderDetailShippingSectionProps) {
  const t = useTranslations('MyOrderDetail');

  return (
    <section className="rounded-2xl border border-line bg-info-soft px-4 py-4 dark:border-dark-border dark:bg-dark-panel">
      <h2 className="inline-flex items-center gap-2 text-base font-semibold text-ink dark:text-surface">
        <IconPackageExport size={18} className="text-primary" />
        {t('labels.shippingInfo')}
      </h2>
      {shipping ? (
        <div className="mt-3 space-y-2 text-sm text-ink dark:text-surface">
          <p className="flex items-start gap-2">
            <IconUser size={16} className="mt-0.5 shrink-0 text-primary" />
            <span>
              {t('labels.recipient')}{' '}
              <span className="font-semibold">{shipping.recipientName}</span>
            </span>
          </p>
          <p className="flex items-start gap-2">
            <IconPhone size={16} className="mt-0.5 shrink-0 text-primary" />
            <span>
              {t('labels.phone')}{' '}
              <span className="font-medium">{shipping.recipientPhone}</span>
            </span>
          </p>
          <p className="flex items-start gap-2 break-all">
            <IconMapPin size={16} className="mt-0.5 shrink-0 text-primary" />
            <span>
              {t('labels.address')}{' '}
              <span className="font-medium">
                {shipping.address1}
                {shipping.address2 ? ` ${shipping.address2}` : ''}
              </span>
            </span>
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted dark:text-dark-muted">
          {t('state.noShipping')}
        </p>
      )}
    </section>
  );
}
