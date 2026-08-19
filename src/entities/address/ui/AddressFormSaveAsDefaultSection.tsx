import { useTranslations } from 'next-intl';

import { cn } from '@shared/lib/utils/style';

type AddressFormSaveAsDefaultSectionProps = {
  saveAsDefault: boolean;
  isSaving: boolean;
  onSaveAsDefaultChange: (isDefault: boolean) => void;
};

export default function AddressFormSaveAsDefaultSection({
  saveAsDefault,
  isSaving,
  onSaveAsDefaultChange,
}: AddressFormSaveAsDefaultSectionProps) {
  const t = useTranslations('MyAddress.createModal');

  return (
    <div className="mt-7 flex items-center justify-between gap-4">
      <div>
        <p className="text-xl font-semibold leading-7 text-ink sm:text-lg sm:leading-6 dark:text-surface">
          {t('saveAsDefault')}
        </p>
        <p className="text-sm text-muted sm:text-sm dark:text-dark-muted">
          {t('saveAsDefaultDescription')}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-label={t('saveAsDefault')}
        aria-checked={saveAsDefault}
        onClick={() => onSaveAsDefaultChange(!saveAsDefault)}
        className={cn(
          'relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border transition-colors sm:h-8 sm:w-14',
          saveAsDefault
            ? 'border-primary bg-primary'
            : 'border-line bg-line dark:border-dark-border dark:bg-dark-bg-hover',
        )}
        disabled={isSaving}
      >
        <span
          className={cn(
            'inline-block h-7 w-7 rounded-full border border-line shadow-xs transition-transform sm:h-6 sm:w-6 dark:border-dark-border',
            saveAsDefault
              ? 'translate-x-8 bg-surface dark:bg-dark-panel sm:translate-x-7'
              : 'translate-x-1 bg-canvas dark:bg-dark-panel',
          )}
        />
      </button>
    </div>
  );
}
