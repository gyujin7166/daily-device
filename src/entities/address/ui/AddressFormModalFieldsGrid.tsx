import type { ChangeEvent, FocusEvent } from 'react';

import { FIELD_CONFIGS } from '@entities/address/model/form';
import type { AddressFieldName } from '@entities/address/model/form';

import { cn } from '@shared/lib/utils/style';

import AddressFormPostcodeField from './AddressFormPostcodeField';
import ShippingFormInput from './ShippingFormInput';

import type { Address } from 'react-daum-postcode';

const ADDRESS_MODAL_FIELD_LABELS: Record<AddressFieldName, string> = {
  name: '수령인 이름',
  phone_number: '연락처',
  address_1: '주소',
  address_2: '상세 주소',
};

const ADDRESS_MODAL_FIELD_PLACEHOLDERS: Record<AddressFieldName, string> = {
  name: '예: 홍길동',
  phone_number: '01012345678',
  address_1: '도로명 또는 지번 주소를 검색하세요',
  address_2: '동/호수 등 상세 주소를 입력하세요',
};

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
              label={ADDRESS_MODAL_FIELD_LABELS[field.name]}
              required={field.required}
              onShowPostcodeChange={onShowPostcodeChange}
              onAddressComplete={onAddressComplete}
            />
          );
        }

        return (
          <ShippingFormInput
            key={field.name}
            label={ADDRESS_MODAL_FIELD_LABELS[field.name]}
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
            placeholder={ADDRESS_MODAL_FIELD_PLACEHOLDERS[field.name]}
          />
        );
      })}
    </div>
  );
}
