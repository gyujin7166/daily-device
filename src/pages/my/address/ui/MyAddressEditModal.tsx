import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  FormProvider,
  useForm,
  useFormContext,
  useFormState,
} from 'react-hook-form';

import { formatAddressPhone } from '@entities/address/model/form';
import type {
  AddressFieldName,
  AddressFormState,
} from '@entities/address/model/form';
import { addressFormSchema } from '@entities/address/model/schema';
import type { AddressFormValues } from '@entities/address/model/schema';
import type { UserAddress } from '@entities/address/model/types';

import { toast } from '@shared/lib/toast';

import type { FieldErrors } from 'react-hook-form';

type MyAddressEditModalProps = {
  editingAddress: UserAddress;
  isSaving: boolean;
  onClose: () => void;
  onSave: (formValues: AddressFormValues) => Promise<void>;
};

const inputClassName =
  'w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-hidden transition-colors focus:border-primary aria-invalid:border-danger dark:border-dark-border dark:bg-dark-bg dark:text-surface';

type MyAddressEditFieldProps = {
  name: AddressFieldName;
  label: string;
  type: 'text' | 'tel';
  placeholder: string;
  isSaving: boolean;
  maxLength?: number;
};

function MyAddressEditField({
  name,
  label,
  type,
  placeholder,
  isSaving,
  maxLength,
}: MyAddressEditFieldProps) {
  const { control, register } = useFormContext<AddressFormValues>();
  const { errors } = useFormState({ control, name, exact: true });

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink dark:text-surface">
        {label}
      </span>
      <input
        {...register(name)}
        type={type}
        className={inputClassName}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={isSaving}
        aria-invalid={Boolean(errors[name])}
      />
    </label>
  );
}

const createEditFormValues = (
  editingAddress: UserAddress,
): AddressFormState => {
  return {
    name: editingAddress.recipientName,
    phone_number: formatAddressPhone(editingAddress.recipientPhone),
    address_1: editingAddress.address1,
    address_2: editingAddress.address2 ?? '',
  };
};

export default function MyAddressEditModal({
  editingAddress,
  isSaving,
  onClose,
  onSave,
}: MyAddressEditModalProps) {
  const t = useTranslations('MyAddress.editModal');
  const tToast = useTranslations('MyAddress.toast');
  const methods = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: createEditFormValues(editingAddress),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const handleInvalid = (errors: FieldErrors<AddressFormValues>) => {
    const phoneNumber = methods.getValues('phone_number').trim();

    if (errors.phone_number && phoneNumber) {
      toast.error(tToast('invalidPhone'));
      return;
    }

    toast.error(tToast('required'));
  };

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

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSave, handleInvalid)}
            className="space-y-4"
            noValidate
          >
            <MyAddressEditField
              name="name"
              label={t('recipient')}
              type="text"
              placeholder={t('recipientPlaceholder')}
              maxLength={30}
              isSaving={isSaving}
            />

            <MyAddressEditField
              name="phone_number"
              label={t('phone')}
              type="tel"
              placeholder="010-1234-5678"
              maxLength={13}
              isSaving={isSaving}
            />

            <MyAddressEditField
              name="address_1"
              label={t('address')}
              type="text"
              placeholder={t('addressPlaceholder')}
              isSaving={isSaving}
            />

            <MyAddressEditField
              name="address_2"
              label={t('addressDetail')}
              type="text"
              placeholder={t('addressDetailPlaceholder')}
              isSaving={isSaving}
            />

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
        </FormProvider>
      </div>
    </div>
  );
}
