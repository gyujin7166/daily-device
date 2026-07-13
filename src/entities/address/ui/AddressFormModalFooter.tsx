import { useTranslations } from 'next-intl';

type AddressFormModalFooterProps = {
  isSaving: boolean;
  isAddressReady: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export default function AddressFormModalFooter({
  isSaving,
  isAddressReady,
  onCancel,
  onSave,
}: AddressFormModalFooterProps) {
  const t = useTranslations('MyAddress.createModal');

  return (
    <div className="flex min-h-21 items-center justify-end gap-3 px-4 py-4 sm:min-h-18 sm:px-6 sm:py-4">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex h-13.5 min-w-30 items-center justify-center rounded-2xl border border-line bg-surface px-6 text-base font-semibold leading-6 text-ink transition hover:bg-canvas sm:h-12 sm:min-w-28 sm:rounded-xl sm:px-5 sm:text-base sm:leading-5 dark:border-dark-border dark:bg-dark-panel dark:text-surface dark:hover:bg-dark-bg-hover"
        disabled={isSaving}
      >
        {t('cancel')}
      </button>
      <button
        type="button"
        disabled={!isAddressReady || isSaving}
        onClick={onSave}
        className="inline-flex h-13.5 min-w-42 items-center justify-center rounded-2xl bg-primary px-8 text-base font-bold leading-6 text-surface shadow-[0_10px_24px_rgba(24,116,209,0.28)] transition enabled:hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text disabled:shadow-none sm:h-12 sm:min-w-37 sm:rounded-xl sm:px-7 sm:text-base sm:leading-5"
      >
        {isSaving ? t('saving') : t('save')}
      </button>
    </div>
  );
}
