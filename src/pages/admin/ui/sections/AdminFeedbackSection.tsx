import { memo } from 'react';

import { useTranslations } from 'next-intl';

type AdminFeedbackSectionProps = {
  canWriteAdmin: boolean;
  message: string;
  error: string;
};

function AdminFeedbackSection({
  canWriteAdmin,
  message,
  error,
}: AdminFeedbackSectionProps) {
  const t = useTranslations('Admin.feedback');

  return (
    <>
      {!canWriteAdmin ? (
        <p className="rounded-md border border-primary/20 bg-primary-soft px-4 py-3 text-sm font-semibold text-primary dark:border-primary/30 dark:bg-dark-bg-hover">
          {t('readOnly')}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-md border border-success/30 bg-success-soft px-4 py-3 text-sm font-semibold text-success">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-danger/30 bg-red-50 px-4 py-3 text-sm font-semibold text-danger dark:bg-red-950/30">
          {error}
        </p>
      ) : null}
    </>
  );
}

export default memo(AdminFeedbackSection);
