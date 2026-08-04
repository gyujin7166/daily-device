import type { UserAddress } from '@entities/address/model/types';

/**
 * 결제 화면에서는 현재 선택한 배송지가 항상 가장 위에 있어야 한다.
 * 기본 배송지는 두 번째 우선순위로 유지해 사용자가 선택값과 기본값을 빠르게 비교할 수 있게 한다.
 */
export const getOrderedCheckoutAddresses = (
  userAddresses: UserAddress[],
  selectedAddressId: number | null,
) => {
  if (!selectedAddressId) {
    return userAddresses;
  }

  const selected = userAddresses.find((item) => item.id === selectedAddressId);
  if (!selected) {
    return userAddresses;
  }

  const defaultItem = userAddresses.find((item) => item.isDefault) ?? null;
  const rest = userAddresses.filter(
    (item) => item.id !== selected.id && item.id !== defaultItem?.id,
  );

  if (defaultItem && defaultItem.id !== selected.id) {
    return [selected, defaultItem, ...rest];
  }

  return [selected, ...rest];
};

export const getPreferredCheckoutAddress = (
  defaultAddress: UserAddress | null,
  recentAddress: UserAddress | null,
) => defaultAddress ?? recentAddress;
