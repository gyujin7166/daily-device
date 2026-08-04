import { isValidName } from '@shared/lib/utils/validation';

import type { Address } from 'react-daum-postcode';

export const FIELD_CONFIGS = [
  {
    type: 'text',
    name: 'name',
    required: true,
  },
  {
    type: 'tel',
    name: 'phone_number',
    required: true,
  },
  {
    type: 'text',
    name: 'address_1',
    required: true,
  },
  {
    type: 'text',
    name: 'address_2',
    required: false,
  },
] as const;

export type AddressFieldName = (typeof FIELD_CONFIGS)[number]['name'];
export type AddressFormState = Record<AddressFieldName, string>;

export const createInitialAddressFormState = (): AddressFormState => ({
  name: '',
  phone_number: '',
  address_1: '',
  address_2: '',
});

export const normalizePhoneNumber = (value: string) =>
  value.replace(/[^\d]/g, '');

export const normalizeAddressFieldValue = (
  fieldName: AddressFieldName,
  value: string,
) => {
  if (fieldName === 'phone_number') {
    return normalizePhoneNumber(value).slice(0, 11);
  }

  return value;
};

const isValidKoreanMobile = (value: string) =>
  /^010\d{8}$/.test(normalizePhoneNumber(value));

/**
 * 현재 checkout/address 폼은 국내 휴대폰 번호만 받는다.
 * 서버 payload와 UI 검증 기준을 맞추기 위해 모든 화면이 이 함수를 공유한다.
 */
export const validateAddressField = (
  value: string,
  inputFieldName: AddressFieldName,
) => {
  if (inputFieldName === 'phone_number') {
    return isValidKoreanMobile(value);
  }

  if (inputFieldName === 'name') {
    return isValidName(value);
  }

  if (inputFieldName === 'address_1') {
    return value.trim() !== '';
  }

  return true;
};

export const hasAddressFormValues = (formState: AddressFormState) =>
  !!(
    formState.name ||
    formState.phone_number ||
    formState.address_1 ||
    formState.address_2
  );

export const formatAddressPhone = (phone: string) => {
  const normalized = normalizePhoneNumber(phone);

  if (normalized.length === 11) {
    return `${normalized.slice(0, 3)}-${normalized.slice(3, 7)}-${normalized.slice(7)}`;
  }

  if (normalized.length === 10) {
    return `${normalized.slice(0, 2)}-${normalized.slice(2, 6)}-${normalized.slice(6)}`;
  }

  return phone;
};

export const buildAddressFromPostcode = (data: Address) => {
  let fullAddress = data.address;
  let extraAddress = '';

  if (data.addressType === 'R') {
    if (data.bname !== '') {
      extraAddress += data.bname;
    }

    if (data.buildingName !== '') {
      extraAddress +=
        extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
    }

    fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
  }

  return fullAddress;
};
