import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCheckoutStore } from '../../model/store/checkoutStore';

import CheckoutFlowShippingColumn from './CheckoutFlowShippingColumn';

describe('CheckoutFlowShippingColumn', () => {
  beforeEach(() => {
    useCheckoutStore.getState().actions.resetCheckoutState();
  });

  it('배송지 모달 상태에 필요한 래퍼만 다시 렌더한다', () => {
    const renderChild = vi.fn();

    function Child() {
      renderChild();
      return <div>배송지 내용</div>;
    }

    render(
      <CheckoutFlowShippingColumn>
        <Child />
      </CheckoutFlowShippingColumn>,
    );

    const shippingColumn = screen.getByText('배송지 내용').parentElement;
    expect(shippingColumn).toHaveClass('xl:z-10');

    act(() => {
      useCheckoutStore.getState().actions.setIsAddressModalOpen(true);
    });

    expect(shippingColumn).toHaveClass('xl:z-150');
    expect(renderChild).toHaveBeenCalledOnce();
  });
});
