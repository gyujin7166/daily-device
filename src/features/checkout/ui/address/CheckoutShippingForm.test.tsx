import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createInitialAddressFormState } from '@entities/address/model/form';
import type { UserAddress } from '@entities/address/model/types';

import { useCheckoutStore } from '../../model/store/checkoutStore';

import CheckoutShippingForm from './CheckoutShippingForm';

const mocks = vi.hoisted(() => ({
  renderAddressSummary: vi.fn(),
  upsertAddress: vi.fn(),
  deleteAddress: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  addresses: [] as UserAddress[],
}));

const savedAddress: UserAddress = {
  id: 1,
  recipientName: '기존 수령인',
  recipientPhone: '01012345678',
  address1: '서울시 기존 주소',
  address2: '101호',
  isDefault: false,
  updatedAt: '2026-08-01T00:00:00.000Z',
};

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('react-daum-postcode', () => ({
  default: ({
    onComplete,
  }: {
    onComplete: (data: {
      address: string;
      addressType: string;
      bname: string;
      buildingName: string;
    }) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onComplete({
          address: '서울시 체크아웃 주소',
          addressType: 'R',
          bname: '',
          buildingName: '',
        })
      }
    >
      completePostcode
    </button>
  ),
}));

vi.mock('@entities/address/queries/useUserAddresses', () => ({
  useUserAddresses: () => ({ data: mocks.addresses, isPending: false }),
}));

vi.mock('@entities/address/queries/useUpsertAddress', () => ({
  useUpsertAddress: () => ({
    mutateAsync: mocks.upsertAddress,
    isPending: false,
  }),
}));

vi.mock('@entities/address/queries/useDeleteAddress', () => ({
  useDeleteAddress: () => ({
    mutateAsync: mocks.deleteAddress,
    isPending: false,
  }),
}));

vi.mock('@shared/hooks/useScrollLock', () => ({
  useScrollLock: vi.fn(),
}));

vi.mock('@shared/lib/toast', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

vi.mock('./AddressSummarySection', () => ({
  default: () => {
    mocks.renderAddressSummary();
    return <div>addressSummary</div>;
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.addresses = [];
  mocks.upsertAddress.mockImplementation(
    async (payload: {
      id?: number;
      recipientName: string;
      recipientPhone: string;
      address1: string;
      address2?: string;
      isDefault: boolean;
    }) => {
      const id = payload.id ?? 7;
      mocks.addresses = [
        {
          id,
          recipientName: payload.recipientName,
          recipientPhone: payload.recipientPhone,
          address1: payload.address1,
          address2: payload.address2 ?? null,
          isDefault: payload.isDefault,
          updatedAt: '2026-08-04T00:00:00.000Z',
        },
      ];
      return { id };
    },
  );
  mocks.deleteAddress.mockResolvedValue({ deletedId: 1 });

  const actions = useCheckoutStore.getState().actions;
  actions.resetCheckoutState();
  actions.setAddressModalMode('new');
  actions.setIsAddressModalOpen(true);
});

describe('CheckoutShippingForm', () => {
  it('배송지 모달을 열 때 확정 배송지 요약을 다시 렌더하지 않는다', () => {
    const actions = useCheckoutStore.getState().actions;
    actions.resetCheckoutState();

    render(<CheckoutShippingForm />);

    const renderCountBeforeModalOpen =
      mocks.renderAddressSummary.mock.calls.length;

    act(() => {
      actions.setIsAddressModalOpen(true);
    });

    expect(mocks.renderAddressSummary).toHaveBeenCalledTimes(
      renderCountBeforeModalOpen,
    );
  });

  it('주소 입력 중 확정 배송지 요약을 다시 렌더하지 않는다', async () => {
    const user = userEvent.setup();
    render(<CheckoutShippingForm />);

    const renderCountBeforeTyping =
      mocks.renderAddressSummary.mock.calls.length;
    await user.type(screen.getByPlaceholderText('placeholders.name'), '홍길동');

    expect(mocks.renderAddressSummary).toHaveBeenCalledTimes(
      renderCountBeforeTyping,
    );
    expect(useCheckoutStore.getState().formState).toEqual(
      createInitialAddressFormState(),
    );
  });

  it('검증된 주소만 정규화해서 저장하고 체크아웃 상태에 반영한다', async () => {
    const user = userEvent.setup();
    render(<CheckoutShippingForm />);

    await user.type(screen.getByPlaceholderText('placeholders.name'), '홍길동');
    await user.type(
      screen.getByPlaceholderText('placeholders.phone_number'),
      '010-9876-5432',
    );
    await user.click(screen.getByPlaceholderText('placeholders.address_1'));
    await user.click(screen.getByRole('button', { name: 'completePostcode' }));
    await user.type(
      screen.getByPlaceholderText('placeholders.address_2'),
      '301호',
    );
    await user.click(screen.getByRole('switch'));

    const saveButton = screen.getByRole('button', { name: 'save' });
    await waitFor(() => expect(saveButton).toBeEnabled());
    await user.click(saveButton);

    await waitFor(() => {
      expect(mocks.upsertAddress).toHaveBeenCalledWith({
        id: undefined,
        recipientName: '홍길동',
        recipientPhone: '01098765432',
        address1: '서울시 체크아웃 주소',
        address2: '301호',
        isDefault: true,
      });
    });
    expect(useCheckoutStore.getState()).toMatchObject({
      formState: {
        name: '홍길동',
        phone_number: '01098765432',
        address_1: '서울시 체크아웃 주소',
        address_2: '301호',
      },
      selectedAddressId: 7,
      addressModalMode: 'saved',
    });
  });

  it('저장 배송지를 수정할 때 기존 값을 채우고 정규화해서 저장한다', async () => {
    mocks.addresses = [savedAddress];
    const actions = useCheckoutStore.getState().actions;
    actions.resetCheckoutState();
    actions.setAddressModalMode('saved');
    actions.setIsAddressModalOpen(true);

    const user = userEvent.setup();
    render(<CheckoutShippingForm />);

    await user.click(screen.getByRole('button', { name: 'edit' }));
    const phoneInput = screen.getByPlaceholderText('placeholders.phone_number');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'save' })).toBeEnabled(),
    );
    expect(screen.getByPlaceholderText('placeholders.name')).toHaveValue(
      '기존 수령인',
    );
    await user.clear(phoneInput);
    await user.type(phoneInput, '010-9999-8888');
    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mocks.upsertAddress).toHaveBeenCalledWith({
        id: 1,
        recipientName: '기존 수령인',
        recipientPhone: '01099998888',
        address1: '서울시 기존 주소',
        address2: '101호',
        isDefault: false,
      });
    });
    expect(useCheckoutStore.getState()).toMatchObject({
      selectedAddressId: 1,
      addressModalMode: 'saved',
    });
  });
});
