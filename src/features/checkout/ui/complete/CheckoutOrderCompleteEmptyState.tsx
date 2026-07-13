import { useTranslations } from 'next-intl';

import { Link } from '@shared/lib/i18n/navigation';

export default function CheckoutOrderCompleteEmptyState() {
  const t = useTranslations('Checkout.complete.empty');

  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs dark:border-dark-border dark:bg-dark-panel">
      <p className="text-sm text-muted dark:text-dark-muted">
        {t('description')}
      </p>
      <div className="mt-4">
        <Link
          href="/my/orders"
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink hover:bg-canvas dark:border-dark-border dark:text-surface dark:hover:bg-dark-bg-hover"
        >
          {t('goToOrders')}
        </Link>
      </div>
    </section>
  );
}
