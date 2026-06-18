import type { MouseEvent } from 'react';

import type { UserAddress } from '@entities/address/model/types';

import CheckoutSavedAddressListSection from './CheckoutSavedAddressListSection';
import CheckoutSavedAddressModalFooter from './CheckoutSavedAddressModalFooter';
import CheckoutSavedAddressModalHeader from './CheckoutSavedAddressModalHeader';

type CheckoutSavedAddressModalProps = {
  state: {
    isOpen: boolean;
    hasSavedAddresses: boolean;
    orderedAddresses: UserAddress[];
    selectedAddressId: number | null;
    hasDefaultAddress: boolean;
    recentAddressId: number | null;
    isAddressActionBusy: boolean;
  };
  actions: {
    onClose: () => void;
    onSwitchToNewMode: () => void;
    onSelectSavedAddress: (savedAddress: UserAddress) => void;
    onEditSavedAddress: (savedAddress: UserAddress) => void;
    onDeleteAddress: (
      event: MouseEvent<HTMLButtonElement>,
      addressId: number,
    ) => void;
  };
};

export default function CheckoutSavedAddressModal({
  state,
  actions,
}: CheckoutSavedAddressModalProps) {
  const {
    isOpen,
    hasSavedAddresses,
    orderedAddresses,
    selectedAddressId,
    hasDefaultAddress,
    recentAddressId,
    isAddressActionBusy,
  } = state;
  const {
    onClose,
    onSwitchToNewMode,
    onSelectSavedAddress,
    onEditSavedAddress,
    onDeleteAddress,
  } = actions;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-surface sm:bg-ink/40 sm:px-4 sm:py-8 dark:bg-dark-elevated/80">
      <div className="relative z-130 flex h-svh w-screen flex-col overflow-hidden rounded-none bg-surface sm:h-auto sm:w-full sm:max-h-[61.5vh] sm:max-w-140 sm:rounded-2xl sm:shadow-lg dark:bg-dark-panel">
        <div className="flex min-h-0 flex-1 flex-col divide-y divide-line bg-canvas sm:bg-surface dark:divide-dark-border dark:bg-dark-panel dark:sm:bg-dark-panel">
          <CheckoutSavedAddressModalHeader onClose={onClose} />

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-6 sm:py-5">
            <CheckoutSavedAddressListSection
              state={{
                hasSavedAddresses,
                orderedAddresses,
                selectedAddressId,
                hasDefaultAddress,
                recentAddressId,
                isAddressActionBusy,
              }}
              actions={{
                onSelectSavedAddress,
                onEditSavedAddress,
                onDeleteAddress,
              }}
            />
          </div>

          <CheckoutSavedAddressModalFooter
            onSwitchToNewMode={onSwitchToNewMode}
          />
        </div>
      </div>
    </div>
  );
}
