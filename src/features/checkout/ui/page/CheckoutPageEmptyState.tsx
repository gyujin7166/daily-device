import { IconArrowLeft, IconShoppingCartQuestion } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import Button from '@shared/ui/Button/Button';

type CheckoutPageEmptyStateProps = {
  onGoHome: () => void;
};

export default function CheckoutPageEmptyState({
  onGoHome,
}: CheckoutPageEmptyStateProps) {
  const t = useTranslations('Checkout.empty');

  return (
    <div className="flex min-h-[calc(100vh-58px)] items-center justify-center md:min-h-[calc(100vh-88px)] lg:min-h-[calc(100vh-104px)]">
      <section className="-translate-y-14.5 text-center md:-translate-y-22 lg:-translate-y-26">
        <div className="grid gap-5 text-center">
          <div className="mx-auto flex h-35 w-35 items-center justify-center rounded-full bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary">
            <IconShoppingCartQuestion size={80} />
          </div>
          <div className="grid gap-2">
            <h3 className="text-2xl font-medium text-ink dark:text-surface">
              {t('title')}
            </h3>
            <p className="text-base text-muted dark:text-dark-muted">
              {t('descriptionLine1')}
              <br />
              {t('descriptionLine2')}
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              type="button"
              variant="primary"
              size="md"
              transition="enabled"
              onClick={onGoHome}
              className="h-12 items-center gap-2.5 rounded-xl border-primary bg-primary px-10 text-on-primary hover:bg-primary-hover hover:text-on-primary dark:border-primary dark:bg-primary dark:text-on-primary dark:hover:bg-primary-hover"
            >
              <span>
                <IconArrowLeft size={20} />
              </span>
              {t('goHome')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
