import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

import { IconAlertCircle, IconMapSearch } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { AddressFieldName } from '@entities/address/model/form';

import { cn } from '@shared/lib/utils/style';

import ShippingFormInputFeedbackMessage from './ShippingFormInputFeedbackMessage';

type ShippingFormInputProps = {
  label: string;
  type: string;
  name: AddressFieldName;
  required: boolean;
  isValid: boolean;
  hasBlurred: boolean;
  placeholder?: string;
  onClick: () => void;
} & Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'name' | 'type' | 'required' | 'placeholder' | 'readOnly' | 'onClick'
>;

const ShippingFormInput = forwardRef<HTMLInputElement, ShippingFormInputProps>(
  function ShippingFormInput(
    {
      label,
      type,
      name,
      required,
      isValid,
      hasBlurred,
      placeholder = '',
      onClick,
      ...inputProps
    },
    ref,
  ) {
    const t = useTranslations('MyAddress.createModal');
    const validMessages: Record<AddressFieldName, string | null> = {
      name: null,
      phone_number: t('helper.phone_number'),
      address_1: null,
      address_2: null,
    };

    const inValidMessages: Record<AddressFieldName, string | null> = {
      name: t('errors.name'),
      phone_number: t('errors.phone_number'),
      address_1: t('errors.address_1'),
      address_2: null,
    };

    const defaultPlaceholders: Record<AddressFieldName, string> = {
      name: t('defaultPlaceholders.name'),
      phone_number: t('defaultPlaceholders.phone_number'),
      address_1: t('defaultPlaceholders.address_1'),
      address_2: t('defaultPlaceholders.address_2'),
    };
    const inputPlaceholder = placeholder || defaultPlaceholders[name];
    const hasInvalidState = required && hasBlurred && !isValid;
    const validMessage = isValid ? validMessages[name] : null;
    const invalidMessage = hasInvalidState
      ? inValidMessages[name] || t('errors.generic', { label })
      : '';

    return (
      <div className="col-span-full flex flex-col items-start gap-2.5 sm:gap-2">
        <label
          className="flex items-center gap-1 text-base font-semibold text-ink sm:text-sm dark:text-surface"
          htmlFor={name}
        >
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
        <div
          className="relative flex w-full flex-col"
          onClick={name === 'address_1' ? onClick : undefined}
        >
          <input
            {...inputProps}
            ref={ref}
            id={name}
            className={cn(
              'min-h-13.5 w-full appearance-none rounded-xl border border-line bg-surface px-4 py-3.5 text-base text-ink placeholder:text-muted/70 disabled:cursor-default disabled:bg-disabled-bg disabled:text-disabled-text focus-visible:border-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20 sm:min-h-12 sm:px-3.5 sm:py-3 sm:text-sm dark:border-dark-border dark:bg-dark-bg-hover dark:text-surface dark:placeholder:text-dark-muted/80',
              name === 'address_1' && 'cursor-pointer pl-12 sm:pl-11',
              hasInvalidState &&
                '!border-danger pr-12 focus-visible:!border-danger focus-visible:ring-danger/20 sm:pr-11',
            )}
            type={type}
            name={name}
            placeholder={inputPlaceholder}
            readOnly={name === 'address_1'}
          />
          {name === 'address_1' && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex aspect-square items-center justify-center">
              <IconMapSearch
                className="text-muted dark:text-dark-muted"
                size={20}
                stroke={2.1}
              />
            </div>
          )}
          {hasInvalidState && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex aspect-square items-center justify-center">
              <IconAlertCircle className="text-danger" size={20} stroke={2.2} />
            </div>
          )}
        </div>
        <ShippingFormInputFeedbackMessage
          isValid={isValid}
          hasInvalidState={hasInvalidState}
          validMessage={validMessage}
          invalidMessage={invalidMessage}
        />
      </div>
    );
  },
);

export default ShippingFormInput;
