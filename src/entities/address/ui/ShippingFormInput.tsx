import { IconAlertCircle, IconMapSearch } from '@tabler/icons-react';

import type { AddressFieldName } from '@entities/address/model/form';

import { cn } from '@shared/lib/utils/style';

import ShippingFormInputFeedbackMessage from './ShippingFormInputFeedbackMessage';

type CheckoutInputFieldProps = {
  label: string;
  type: string;
  name: AddressFieldName;
  required: boolean;
  value: string;
  isValid: boolean;
  hasBlurred: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onClick: () => void;
  address: string;
  containerClassName?: string;
};

export default function ShippingFormInput({
  label,
  type,
  name,
  required,
  value,
  isValid,
  hasBlurred,
  onChange,
  onBlur,
  placeholder = '',
  onClick,
  address,
  containerClassName = '',
}: CheckoutInputFieldProps) {
  const validMessages: Record<AddressFieldName, string | null> = {
    name: null,
    phone_number: '배송을 위해서만 사용됩니다.',
    address_1: null,
    address_2: null,
  };

  const inValidMessages: Record<AddressFieldName, string | null> = {
    name: '이름 형식이 올바르지 않습니다. (한글/영문, 공백만 가능)',
    phone_number: '휴대폰 번호 형식이 올바르지 않습니다. (예: 01012345678)',
    address_1: '주소를 입력해주세요.',
    address_2: null,
  };

  const defaultPlaceholders: Record<AddressFieldName, string> = {
    name: '수령인 이름을 입력하세요',
    phone_number: "'-' 없이 숫자만 입력하세요",
    address_1: '주소를 검색하세요',
    address_2: '상세주소를 입력하세요',
  };
  const inputPlaceholder = placeholder || defaultPlaceholders[name];
  const hasInvalidState = required && hasBlurred && !isValid;
  const validMessage = isValid ? validMessages[name] : null;
  const invalidMessage = hasInvalidState
    ? inValidMessages[name] || `${label} 형식이 올바르지 않습니다.`
    : '';

  return (
    <div
      className={cn(
        'col-span-full flex flex-col items-start gap-2.5 sm:gap-2',
        containerClassName,
      )}
    >
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
          id={name}
          className={cn(
            'min-h-13.5 w-full appearance-none rounded-xl border border-line bg-surface px-4 py-3.5 text-base text-ink placeholder:text-muted/70 disabled:cursor-default disabled:bg-disabled-bg disabled:text-disabled-text focus-visible:border-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20 sm:min-h-12 sm:px-3.5 sm:py-3 sm:text-sm dark:border-dark-border dark:bg-dark-bg-hover dark:text-surface dark:placeholder:text-dark-muted/80',
            name === 'address_1' && 'cursor-pointer pl-12 sm:pl-11',
            hasInvalidState &&
              '!border-danger pr-12 focus-visible:!border-danger focus-visible:ring-danger/20 sm:pr-11',
          )}
          type={type}
          name={name}
          value={name === 'address_1' ? address : value}
          onChange={onChange}
          onBlur={onBlur}
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
}
