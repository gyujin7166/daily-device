import type { ChangeEvent, FocusEvent } from 'react';

import type { AddressFieldName } from '@entities/address/model/form';

import AddressFormModalFieldsGrid from './AddressFormModalFieldsGrid';
import AddressFormSaveAsDefaultSection from './AddressFormSaveAsDefaultSection';

import type { Address } from 'react-daum-postcode';

type AddressFormModalContentSectionProps = {
  showPostcode: boolean;
  formState: Record<AddressFieldName, string>;
  validationState: Record<AddressFieldName, boolean>;
  blurState: Record<AddressFieldName, boolean>;
  address: string;
  saveAsDefault: boolean;
  isSaving: boolean;
  onShowPostcodeChange: (isOpen: boolean) => void;
  onSaveAsDefaultChange: (isDefault: boolean) => void;
  onAddressComplete: (data: Address) => void;
  onFieldChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFieldBlur: (event: FocusEvent<HTMLInputElement>) => void;
};

export default function AddressFormModalContentSection({
  showPostcode,
  formState,
  validationState,
  blurState,
  address,
  saveAsDefault,
  isSaving,
  onShowPostcodeChange,
  onSaveAsDefaultChange,
  onAddressComplete,
  onFieldChange,
  onFieldBlur,
}: AddressFormModalContentSectionProps) {
  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-5 sm:px-6 sm:py-5">
      <AddressFormModalFieldsGrid
        showPostcode={showPostcode}
        formState={formState}
        validationState={validationState}
        blurState={blurState}
        address={address}
        onShowPostcodeChange={onShowPostcodeChange}
        onAddressComplete={onAddressComplete}
        onFieldChange={onFieldChange}
        onFieldBlur={onFieldBlur}
      />

      {!showPostcode ? (
        <AddressFormSaveAsDefaultSection
          saveAsDefault={saveAsDefault}
          isSaving={isSaving}
          onSaveAsDefaultChange={onSaveAsDefaultChange}
        />
      ) : null}
    </div>
  );
}
