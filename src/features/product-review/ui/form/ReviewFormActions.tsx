import { useTranslations } from 'next-intl';

import Spinner from '@shared/ui/Loading/Spinner/Spinner';

type ReviewFormActionsProps = {
  isEditing: boolean;
  isPending: boolean;
  isUploading: boolean;
  onCancel: () => void;
};

export default function ReviewFormActions({
  isEditing,
  isPending,
  isUploading,
  onCancel,
}: ReviewFormActionsProps) {
  const t = useTranslations('ReviewWrite.form');

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 dark:border-dark-border dark:bg-dark-panel">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-primary bg-transparent px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft dark:border-primary dark:text-primary dark:hover:bg-primary/15"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={isPending || isUploading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <Spinner size="sm" variant="inverse" />
              {t('uploadingImage')}
            </>
          ) : isPending ? (
            <>
              <Spinner size="sm" variant="inverse" />
              {isEditing ? t('updating') : t('submitting')}
            </>
          ) : isEditing ? (
            t('editSubmit')
          ) : (
            t('writeSubmit')
          )}
        </button>
      </div>
    </div>
  );
}
