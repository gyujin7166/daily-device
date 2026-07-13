import { IconCube, IconMessage, IconStarFilled } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

export default function NoReviewProduct() {
  const t = useTranslations('ProductReview.empty');

  return (
    <section className="rounded-3xl border border-line bg-surface px-5 py-12 text-center sm:px-8 sm:py-16 dark:border-dark-border dark:bg-dark-panel/50">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <div className="relative mb-8 h-44 w-60">
          <div className="absolute left-1/2 top-0 flex h-36 w-36 -translate-x-1/2 items-center justify-center rounded-3xl border border-line bg-surface shadow-lg dark:border-dark-border dark:bg-dark-panel">
            <IconCube
              size={52}
              stroke={1.8}
              className="text-primary dark:text-blue-300"
            />
            <div className="absolute right-9 top-8 flex h-10 w-10 animate-bounce items-center justify-center rounded-xl bg-primary text-surface shadow-lg [animation-duration:1.7s] motion-reduce:animate-none">
              <IconStarFilled size={18} />
            </div>
            <div className="absolute bottom-9 flex gap-2">
              <span className="h-1 w-7 rounded-full bg-primary/20" />
              <span className="h-1 w-7 rounded-full bg-primary/20" />
              <span className="h-1 w-7 rounded-full bg-primary/20" />
            </div>
          </div>

          <div className="absolute bottom-0 left-6 flex h-16 w-18 items-center justify-center rounded-2xl border border-line bg-surface shadow-lg dark:border-dark-border dark:bg-dark-bg">
            <IconMessage
              size={26}
              stroke={1.7}
              className="text-disabled-text dark:text-dark-muted"
            />
          </div>
        </div>

        <h3 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl dark:text-surface">
          {t('productTitle')}
        </h3>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7 dark:text-dark-muted">
          {t('productDescription')}
        </p>
      </div>
    </section>
  );
}
