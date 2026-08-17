import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCheckoutStore } from '../../model/store/checkoutStore';

import CheckoutFlowShippingSection from './CheckoutFlowShippingSection';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('../address/CheckoutShippingForm', () => ({
  default: () => <div>배송지 폼</div>,
}));

describe('CheckoutFlowShippingSection', () => {
  beforeEach(() => {
    useCheckoutStore.getState().actions.resetCheckoutState();
  });

  it('배송지 선택 버튼에서 저장된 배송지 모달을 연다', () => {
    const actions = useCheckoutStore.getState().actions;
    actions.setEditingAddressId(12);
    actions.setAddressModalMode('new');

    render(<CheckoutFlowShippingSection />);

    fireEvent.click(
      screen.getByRole('button', { name: 'shipping.selectOrEnter' }),
    );

    expect(useCheckoutStore.getState()).toMatchObject({
      editingAddressId: null,
      addressModalMode: 'saved',
      isAddressModalOpen: true,
    });
  });
});
