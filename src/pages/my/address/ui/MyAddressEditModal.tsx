import type { ChangeEvent, SubmitEvent } from 'react';

import { useTranslations } from 'next-intl';

import type { AddressEditForm } from '@features/my/model/addressManagement';

import type { UserAddress } from '@entities/address/model/types';

type MyAddressEditModalProps = {
  editingAddress: UserAddress | null;
  editForm: AddressEditForm;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onFieldChange: (
    field: keyof AddressEditForm,
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function MyAddressEditModal({
  editingAddress,
  editForm,
  isSaving,
  onClose,
  onSubmit,
  onFieldChange,
}: MyAddressEditModalProps) {
  const t = useTranslations('MyAddress.editModal');

  if (!editingAddress) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-90 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('ariaLabel')}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl border border-line bg-surface p-6 shadow-xl dark:border-dark-border dark:bg-dark-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {t('eyebrow')}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-ink dark:text-surface">
            {t('title')}
          </h2>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink dark:text-surface">
              {t('recipient')}
            </span>
            <input
              type="text"
              value={editForm.recipientName}
              onChange={onFieldChange('recipientName')}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-hidden transition-colors focus:border-primary dark:border-dark-border dark:bg-dark-bg dark:text-surface"
              placeholder={t('recipientPlaceholder')}
              maxLength={30}
              disabled={isSaving}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink dark:text-surface">
              {t('phone')}
            </span>
            <input
              type="tel"
              value={editForm.recipientPhone}
              onChange={onFieldChange('recipientPhone')}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-hidden transition-colors focus:border-primary dark:border-dark-border dark:bg-dark-bg dark:text-surface"
              placeholder="010-1234-5678"
              maxLength={13}
              disabled={isSaving}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink dark:text-surface">
              {t('address')}
            </span>
            <input
              type="text"
              value={editForm.address1}
              onChange={onFieldChange('address1')}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-hidden transition-colors focus:border-primary dark:border-dark-border dark:bg-dark-bg dark:text-surface"
              placeholder={t('addressPlaceholder')}
              disabled={isSaving}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink dark:text-surface">
              {t('addressDetail')}
            </span>
            <input
              type="text"
              value={editForm.address2}
              onChange={onFieldChange('address2')}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-hidden transition-colors focus:border-primary dark:border-dark-border dark:bg-dark-bg dark:text-surface"
              placeholder={t('addressDetailPlaceholder')}
              disabled={isSaving}
            />
          </label>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-muted transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted dark:hover:bg-dark-bg-hover"
              disabled={isSaving}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-surface transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
