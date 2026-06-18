import type { UserAddress } from '@entities/address/model/types';

import { cn } from '@shared/lib/utils/style';

import MyAddressCard from './AddressManagementCard';

type MyAddressListSectionProps = {
  addresses: UserAddress[];
  processingAddressId: number | null;
  animatedAddressId: number | null;
  isDefaultUpdatePending: boolean;
  onEdit: (address: UserAddress) => void;
  onDelete: (addressId: number) => void;
  onSetDefault: (address: UserAddress) => void;
};

export default function MyAddressListSection({
  addresses,
  processingAddressId,
  animatedAddressId,
  isDefaultUpdatePending,
  onEdit,
  onDelete,
  onSetDefault,
}: MyAddressListSectionProps) {
  return (
    <div
      className={cn(
        'space-y-4 transition-opacity duration-200',
        isDefaultUpdatePending
          ? 'pointer-events-none select-none opacity-60'
          : 'opacity-100',
      )}
      aria-busy={isDefaultUpdatePending}
    >
      {addresses.map((address) => (
        <MyAddressCard
          key={address.id}
          address={address}
          isProcessing={processingAddressId === address.id}
          isAnimatedDefault={
            animatedAddressId === address.id && !!address.isDefault
          }
          onEdit={onEdit}
          onDelete={onDelete}
          onSetDefault={onSetDefault}
        />
      ))}
    </div>
  );
}
