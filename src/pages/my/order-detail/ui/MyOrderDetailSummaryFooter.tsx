import { useFormatter, useTranslations } from 'next-intl';

type MyOrderDetailSummaryFooterProps = {
  totalPrice: number;
  deliveryDate: string | null;
};

export default function MyOrderDetailSummaryFooter({
  totalPrice,
  deliveryDate,
}: MyOrderDetailSummaryFooterProps) {
  const t = useTranslations('MyOrderDetail');
  const format = useFormatter();
  const deliveryDateValue = deliveryDate ? new Date(deliveryDate) : null;
  const deliveryDateText =
    deliveryDateValue && !Number.isNaN(deliveryDateValue.getTime())
      ? format.dateTime(deliveryDateValue, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        })
      : null;

  return (
    <footer className="border-t border-line px-5 py-4 sm:px-6 dark:border-dark-border">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-base font-semibold text-muted sm:text-lg dark:text-dark-muted">
          {t('labels.totalPrice')}
        </span>
        <span className="text-xl font-semibold leading-none tracking-[-0.02em] text-ink sm:text-2xl dark:text-surface">
          {t('format.currency', { amount: format.number(totalPrice) })}
        </span>
      </div>
      {deliveryDateText ? (
        <p className="mt-3 text-sm text-muted dark:text-dark-muted">
          {t('labels.deliveryDate')}{' '}
          <span className="font-medium">{deliveryDateText}</span>
        </p>
      ) : null}
    </footer>
  );
}
