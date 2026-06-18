import type { MouseEvent } from 'react';

import type { UserAddress } from '@entities/address/model/types';

import SavedAddressCard from './SavedAddressCard';

type CheckoutSavedAddressListSectionProps = {
  state: {
    hasSavedAddresses: boolean;
    orderedAddresses: UserAddress[];
    selectedAddressId: number | null;
    hasDefaultAddress: boolean;
    recentAddressId: number | null;
    isAddressActionBusy: boolean;
  };
  actions: {
    onSelectSavedAddress: (savedAddress: UserAddress) => void;
    onEditSavedAddress: (savedAddress: UserAddress) => void;
    onDeleteAddress: (
      event: MouseEvent<HTMLButtonElement>,
      addressId: number,
    ) => void;
  };
};

export default function CheckoutSavedAddressListSection({
  state,
  actions,
}: CheckoutSavedAddressListSectionProps) {
  const {
    hasSavedAddresses,
    orderedAddresses,
    selectedAddressId,
    hasDefaultAddress,
    recentAddressId,
    isAddressActionBusy,
  } = state;
  const { onSelectSavedAddress, onEditSavedAddress, onDeleteAddress } = actions;

  if (!hasSavedAddresses) {
    return (
      <p className="px-1 text-sm text-muted dark:text-dark-muted">
        저장된 배송지가 없습니다.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-3">
      {orderedAddresses.map((item) => (
        <SavedAddressCard
          key={item.id}
          state={{
            item,
            isSelected: selectedAddressId === item.id,
            isRecentBadgeTarget:
              !hasDefaultAddress && recentAddressId === item.id,
            isAddressActionBusy,
          }}
          actions={{
            onSelectSavedAddress,
            onEditSavedAddress,
            onDeleteAddress,
          }}
        />
      ))}
    </div>
  );
}
