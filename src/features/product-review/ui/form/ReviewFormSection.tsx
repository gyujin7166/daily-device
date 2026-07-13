import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

type ReviewFormSectionProps = {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
};

export default function ReviewFormSection({
  label,
  required = false,
  optional = false,
  children,
}: ReviewFormSectionProps) {
  const t = useTranslations('ReviewWrite.form');

  return (
    <section className="rounded-2xl border border-line bg-surface p-6 dark:border-dark-border dark:bg-dark-panel">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-muted dark:text-dark-muted">
          {label}
          {required ? (
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
          ) : null}
        </p>
        {optional ? (
          <span className="text-xs font-medium text-primary dark:text-blue-300">
            {t('optional')}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}
