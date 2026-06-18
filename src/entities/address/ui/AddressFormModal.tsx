import type { AddressFieldName } from '@entities/address/model/form';

import AddressFormModalContentSection from './AddressFormModalContentSection';
import AddressFormModalFooter from './AddressFormModalFooter';
import AddressFormModalHeader from './AddressFormModalHeader';

import type { Address } from 'react-daum-postcode';

type AddressFormModalProps = {
  isOpen: boolean;
  state: {
    title: string;
    description?: string;
    isSaving: boolean;
    showPostcode: boolean;
    formState: Record<AddressFieldName, string>;
    validationState: Record<AddressFieldName, boolean>;
    blurState: Record<AddressFieldName, boolean>;
    address: string;
    saveAsDefault: boolean;
    isAddressReady: boolean;
  };
  actions: {
    onClose: () => void;
    onCancel: () => void;
    onSave: () => void;
    onShowPostcodeChange: (isOpen: boolean) => void;
    onSaveAsDefaultChange: (isDefault: boolean) => void;
    onAddressComplete: (data: Address) => void;
    onFieldChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFieldBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  };
};

export default function AddressFormModal({
  isOpen,
  state,
  actions,
}: AddressFormModalProps) {
  const {
    title,
    description = '배송 정보를 입력해주세요.',
    isSaving,
    showPostcode,
    formState,
    validationState,
    blurState,
    address,
    saveAsDefault,
    isAddressReady,
  } = state;
  const {
    onClose,
    onCancel,
    onSave,
    onShowPostcodeChange,
    onSaveAsDefaultChange,
    onAddressComplete,
    onFieldChange,
    onFieldBlur,
  } = actions;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-surface sm:bg-ink/40 sm:px-4 sm:py-8 dark:bg-dark-elevated/80">
      <div className="relative z-130 flex h-svh w-screen flex-col overflow-hidden rounded-none bg-surface sm:h-auto sm:w-full sm:max-h-[61.5vh] sm:max-w-140 sm:rounded-2xl sm:shadow-lg dark:bg-dark-panel">
        <AddressFormModalHeader
          title={title}
          description={description}
          isSaving={isSaving}
          onClose={onClose}
        />
        <AddressFormModalContentSection
          showPostcode={showPostcode}
          formState={formState}
          validationState={validationState}
          blurState={blurState}
          address={address}
          saveAsDefault={saveAsDefault}
          isSaving={isSaving}
          onShowPostcodeChange={onShowPostcodeChange}
          onSaveAsDefaultChange={onSaveAsDefaultChange}
          onAddressComplete={onAddressComplete}
          onFieldChange={onFieldChange}
          onFieldBlur={onFieldBlur}
        />
        <AddressFormModalFooter
          isSaving={isSaving}
          isAddressReady={isAddressReady}
          onCancel={onCancel}
          onSave={onSave}
        />
      </div>
    </div>
  );
}
