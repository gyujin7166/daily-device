import type { ChangeEvent, FocusEvent } from 'react';

import { useTranslations } from 'next-intl';

import { FIELD_CONFIGS } from '@entities/address/model/form';
import type { AddressFieldName } from '@entities/address/model/form';

import { cn } from '@shared/lib/utils/style';

import AddressFormPostcodeField from './AddressFormPostcodeField';
import ShippingFormInput from './ShippingFormInput';

import type { Address } from 'react-daum-postcode';

type AddressFormModalFieldsGridProps = {
  showPostcode: boolean;
  formState: Record<AddressFieldName, string>;
  validationState: Record<AddressFieldName, boolean>;
  blurState: Record<AddressFieldName, boolean>;
  address: string;
  onShowPostcodeChange: (isOpen: boolean) => void;
  onAddressComplete: (data: Address) => void;
  onFieldChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFieldBlur: (event: FocusEvent<HTMLInputElement>) => void;
};

export default function AddressFormModalFieldsGrid({
  showPostcode,
  formState,
  validationState,
  blurState,
  address,
  onShowPostcodeChange,
  onAddressComplete,
  onFieldChange,
  onFieldBlur,
}: AddressFormModalFieldsGridProps) {
  const t = useTranslations('MyAddress.createModal');
  const visibleAddressModalFields = FIELD_CONFIGS.filter((field) => {
    if (showPostcode) {
      return field.name === 'address_1';
    }
    return true;
  });

  return (
    <div className={cn('grid grid-cols-1', showPostcode ? 'gap-3' : 'gap-6')}>
      {visibleAddressModalFields.map((field) => {
        if (field.name === 'address_1' && showPostcode) {
          return (
            <AddressFormPostcodeField
              key={field.name}
              label={t(`fields.${field.name}`)}
              required={field.required}
              onShowPostcodeChange={onShowPostcodeChange}
              onAddressComplete={onAddressComplete}
            />
          );
        }

        return (
          <ShippingFormInput
            key={field.name}
            label={t(`fields.${field.name}`)}
            type={field.type}
            name={field.name}
            required={field.required}
            value={formState[field.name]}
            isValid={validationState[field.name]}
            hasBlurred={blurState[field.name]}
            onChange={onFieldChange}
            onBlur={onFieldBlur}
            onClick={() => onShowPostcodeChange(true)}
            address={address}
            placeholder={t(`placeholders.${field.name}`)}
          />
        );
      })}
    </div>
  );
}
