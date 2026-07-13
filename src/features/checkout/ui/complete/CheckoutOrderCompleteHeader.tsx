import { useLocale, useTranslations } from 'next-intl';

import { formatDate } from '@shared/lib/utils/formatDate';

type CheckoutOrderCompleteHeaderProps = {
  orderNumber: string;
  createdAt: string;
};

export default function CheckoutOrderCompleteHeader({
  orderNumber,
  createdAt,
}: CheckoutOrderCompleteHeaderProps) {
  const locale = useLocale();
  const t = useTranslations('Checkout.complete');

  return (
    <div className="px-8 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-ink dark:text-surface">
            {t('title')}
          </h3>
          <p className="mt-2 text-sm text-muted dark:text-dark-muted">
            {t('orderNumber')}{' '}
            <span className="font-semibold text-ink dark:text-surface">
              #{orderNumber}
            </span>{' '}
            · {formatDate(createdAt, locale)}
          </p>
          <p className="mt-3 rounded-xl bg-primary-soft px-4 py-3 text-sm leading-6 text-primary dark:bg-blue-950/35 dark:text-blue-100">
            {t('demoNotice')}
          </p>
        </div>
      </div>
    </div>
  );
}
