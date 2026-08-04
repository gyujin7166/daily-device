import type { ReactNode } from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UserAddress } from '@entities/address/model/types';

import MyAddressContent from './MyAddressContent';

const mocks = vi.hoisted(() => ({
  upsertAddress: vi.fn(),
  deleteAddress: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

const address: UserAddress = {
  id: 1,
  recipientName: '기존 수령인',
  recipientPhone: '01012345678',
  address1: '서울시 기존 주소',
  address2: '101호',
  isDefault: false,
  updatedAt: '2026-08-01T00:00:00.000Z',
};

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) =>
    namespace === 'MyAddress.toast' ? `toast.${key}` : key,
  useFormatter: () => ({
    number: (value: number) => String(value),
    dateTime: () => '2026. 8. 1.',
  }),
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
          address: '서울시 새 주소',
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
  useSuspenseUserAddresses: () => ({ data: [address] }),
}));

vi.mock('@entities/address/queries/useUpsertAddress', () => ({
  useUpsertAddress: () => ({ mutateAsync: mocks.upsertAddress }),
}));

vi.mock('@entities/address/queries/useDeleteAddress', () => ({
  useDeleteAddress: () => ({ mutateAsync: mocks.deleteAddress }),
}));

vi.mock('@shared/hooks/useScrollLock', () => ({
  useScrollLock: vi.fn(),
}));

vi.mock('@shared/lib/i18n/navigation', () => ({
  Link: ({ children }: { children: ReactNode }) => <>{children}</>,
  usePathname: () => '/my/address',
}));

vi.mock('@shared/lib/toast', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

beforeEach(() => {
  mocks.upsertAddress.mockResolvedValue({ id: 1 });
  mocks.deleteAddress.mockResolvedValue({ deletedId: 1 });
});

describe('MyAddressContent', () => {
  it('새 배송지를 검증하고 정규화된 payload로 저장한다', async () => {
    const user = userEvent.setup();
    render(<MyAddressContent />);

    await user.click(screen.getByRole('button', { name: 'add' }));
    await user.type(screen.getByPlaceholderText('placeholders.name'), '홍길동');
    await user.type(
      screen.getByPlaceholderText('placeholders.phone_number'),
      '010-9876-5432',
    );
    await user.click(screen.getByPlaceholderText('placeholders.address_1'));
    await user.click(screen.getByRole('button', { name: 'completePostcode' }));
    await user.type(
      screen.getByPlaceholderText('placeholders.address_2'),
      '202호',
    );
    await user.click(screen.getByRole('switch'));

    const saveButton = screen.getByRole('button', { name: 'save' });
    await waitFor(() => expect(saveButton).toBeEnabled());
    await user.click(saveButton);

    await waitFor(() => {
      expect(mocks.upsertAddress).toHaveBeenCalledWith({
        recipientName: '홍길동',
        recipientPhone: '01098765432',
        address1: '서울시 새 주소',
        address2: '202호',
        isDefault: true,
      });
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith('toast.createSuccess');
  });

  it('수정 폼의 전화번호를 검증한 뒤 정규화해서 저장한다', async () => {
    const user = userEvent.setup();
    render(<MyAddressContent />);

    await user.click(screen.getByRole('button', { name: 'edit' }));
    const phoneInput = screen.getByPlaceholderText('010-1234-5678');
    await user.clear(phoneInput);
    await user.type(phoneInput, '010-1234');
    await user.click(screen.getByRole('button', { name: 'save' }));

    expect(mocks.toastError).toHaveBeenCalledWith('toast.invalidPhone');
    expect(mocks.upsertAddress).not.toHaveBeenCalled();

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
    expect(mocks.toastSuccess).toHaveBeenCalledWith('toast.editSuccess');
  });
});
