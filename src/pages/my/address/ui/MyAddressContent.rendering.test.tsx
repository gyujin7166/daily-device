import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { UserAddress } from '@entities/address/model/types';

import MyAddressContent from './MyAddressContent';

const mocks = vi.hoisted(() => ({
  renderAddressList: vi.fn(),
  upsertAddress: vi.fn(),
  deleteAddress: vi.fn(),
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
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({
    number: (value: number) => String(value),
    dateTime: () => '2026. 8. 1.',
  }),
}));

vi.mock('react-daum-postcode', () => ({
  default: () => null,
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
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('./MyAddressListSection', () => ({
  default: () => {
    mocks.renderAddressList();
    return <div>addressList</div>;
  },
}));

describe('MyAddressContent rendering', () => {
  it('새 배송지 입력 중 주소 목록을 다시 렌더하지 않는다', async () => {
    const user = userEvent.setup();
    render(<MyAddressContent />);

    await user.click(screen.getByRole('button', { name: 'add' }));
    const nameInput = screen.getByPlaceholderText('placeholders.name');
    const renderCountBeforeTyping = mocks.renderAddressList.mock.calls.length;

    await user.type(nameInput, '홍길동');

    expect(mocks.renderAddressList).toHaveBeenCalledTimes(
      renderCountBeforeTyping,
    );
  });
});
