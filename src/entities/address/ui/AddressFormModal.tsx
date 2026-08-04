import { useState } from 'react';
import type { ChangeEvent, FocusEvent } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useFormState,
} from 'react-hook-form';

import { cn } from '@shared/lib/utils/style';

import {
  buildAddressFromPostcode,
  createInitialAddressFormState,
  FIELD_CONFIGS,
  normalizeAddressFieldValue,
} from '../model/form';
import { addressCreateFormSchema } from '../model/schema';

import AddressFormModalFooter from './AddressFormModalFooter';
import AddressFormModalHeader from './AddressFormModalHeader';
import AddressFormPostcodeField from './AddressFormPostcodeField';
import AddressFormSaveAsDefaultSection from './AddressFormSaveAsDefaultSection';
import ShippingFormInput from './ShippingFormInput';

import type {
  AddressCreateFormValues,
  AddressFormValues,
} from '../model/schema';
import type { Address } from 'react-daum-postcode';
import type { SubmitErrorHandler } from 'react-hook-form';

type AddressFormModalProps = {
  title?: string;
  description?: string;
  initialValues?: AddressFormValues;
  initialIsDefault?: boolean;
  isSaving: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSave: (formValues: AddressFormValues, isDefault: boolean) => Promise<void>;
  onInvalid?: () => void;
};

type AddressFieldConfig = (typeof FIELD_CONFIGS)[number];

type AddressFormFieldProps = {
  field: AddressFieldConfig;
  isSaving: boolean;
  onShowPostcode: () => void;
};

function AddressFormField({
  field,
  isSaving,
  onShowPostcode,
}: AddressFormFieldProps) {
  const t = useTranslations('MyAddress.createModal');
  const { control, register } = useFormContext<AddressCreateFormValues>();
  const { dirtyFields, errors, isSubmitted, touchedFields } = useFormState({
    control,
    name: field.name,
    exact: true,
  });
  const { ref, onBlur, onChange, ...registration } = register(field.name);
  const isValid = Boolean(dirtyFields[field.name] && !errors[field.name]);
  const hasBlurred = Boolean(touchedFields[field.name] || isSubmitted);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.currentTarget.value = normalizeAddressFieldValue(
      field.name,
      event.currentTarget.value,
    );
    void onChange(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    event.currentTarget.value = normalizeAddressFieldValue(
      field.name,
      event.currentTarget.value,
    );
    void onBlur(event);
  };

  return (
    <ShippingFormInput
      {...registration}
      ref={ref}
      label={t(`fields.${field.name}`)}
      type={field.type}
      name={field.name}
      required={field.required}
      isValid={isValid}
      hasBlurred={hasBlurred}
      onChange={handleChange}
      onBlur={handleBlur}
      onClick={onShowPostcode}
      placeholder={t(`placeholders.${field.name}`)}
      disabled={isSaving}
      aria-invalid={Boolean(errors[field.name])}
    />
  );
}

function AddressFormDefaultField({ isSaving }: { isSaving: boolean }) {
  const { control } = useFormContext<AddressCreateFormValues>();

  return (
    <Controller
      name="isDefault"
      control={control}
      render={({ field }) => (
        <AddressFormSaveAsDefaultSection
          saveAsDefault={field.value}
          isSaving={isSaving}
          onSaveAsDefaultChange={field.onChange}
        />
      )}
    />
  );
}

function AddressFormFooter({
  isSaving,
  onCancel,
}: {
  isSaving: boolean;
  onCancel: () => void;
}) {
  const { control } = useFormContext<AddressCreateFormValues>();
  const { isValid } = useFormState({ control });

  return (
    <AddressFormModalFooter
      isSaving={isSaving}
      isAddressReady={isValid}
      onCancel={onCancel}
      submit
    />
  );
}

export default function AddressFormModal({
  title,
  description,
  initialValues,
  initialIsDefault = false,
  isSaving,
  onClose,
  onCancel,
  onSave,
  onInvalid,
}: AddressFormModalProps) {
  const t = useTranslations('MyAddress.createModal');
  const [showPostcode, setShowPostcode] = useState(false);
  const methods = useForm<AddressCreateFormValues>({
    resolver: zodResolver(addressCreateFormSchema),
    defaultValues: {
      ...createInitialAddressFormState(),
      ...initialValues,
      isDefault: initialIsDefault,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const handleAddressComplete = (data: Address) => {
    methods.setValue('address_1', buildAddressFromPostcode(data), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setShowPostcode(false);
  };

  const handleSave = async (values: AddressCreateFormValues) => {
    const { isDefault, ...formValues } = values;
    await onSave(formValues, isDefault);
  };

  const handleInvalid: SubmitErrorHandler<AddressCreateFormValues> = () => {
    onInvalid?.();
  };

  return (
    <FormProvider {...methods}>
      <div
        className="fixed inset-0 z-120 flex items-center justify-center bg-surface sm:bg-ink/40 sm:px-4 sm:py-8 dark:bg-dark-elevated/80"
        role="dialog"
        aria-modal="true"
        aria-label={title ?? t('title')}
      >
        <div className="relative z-130 flex h-svh w-screen flex-col overflow-hidden rounded-none bg-surface sm:h-auto sm:w-full sm:max-h-[61.5vh] sm:max-w-140 sm:rounded-2xl sm:shadow-lg dark:bg-dark-panel">
          <AddressFormModalHeader
            title={title ?? t('title')}
            description={description ?? t('description')}
            isSaving={isSaving}
            onClose={onClose}
          />
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={methods.handleSubmit(handleSave, handleInvalid)}
            noValidate
          >
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-5 sm:px-6 sm:py-5">
              <div
                className={cn(
                  'grid grid-cols-1',
                  showPostcode ? 'gap-3' : 'gap-6',
                )}
              >
                {showPostcode ? (
                  <AddressFormPostcodeField
                    label={t('fields.address_1')}
                    required
                    onShowPostcodeChange={setShowPostcode}
                    onAddressComplete={handleAddressComplete}
                  />
                ) : (
                  FIELD_CONFIGS.map((field) => (
                    <AddressFormField
                      key={field.name}
                      field={field}
                      isSaving={isSaving}
                      onShowPostcode={() => setShowPostcode(true)}
                    />
                  ))
                )}
              </div>

              {!showPostcode ? (
                <AddressFormDefaultField isSaving={isSaving} />
              ) : null}
            </div>
            <AddressFormFooter isSaving={isSaving} onCancel={onCancel} />
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
