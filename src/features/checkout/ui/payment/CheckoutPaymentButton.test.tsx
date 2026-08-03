import type React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TestIntlProvider } from '../../../../../test/render';

import CheckoutPaymentButton from './CheckoutPaymentButton';

const messages = {
  Checkout: {
    payment: {
      methods: {
        test: {
          title: '테스트 결제',
          description: '토스 테스트 결제창으로 이동합니다.',
        },
        demo: {
          title: '데모 결제',
          description: '결제 승인 없이 주문을 확정합니다.',
        },
      },
    },
  },
};

function renderCheckoutPaymentButton(
  props: React.ComponentProps<typeof CheckoutPaymentButton>,
) {
  return render(
    <TestIntlProvider locale="ko" messages={messages}>
      <CheckoutPaymentButton {...props} />
    </TestIntlProvider>,
  );
}

describe('CheckoutPaymentButton', () => {
  it('선택된 결제 수단을 표시하고 다른 결제 수단을 선택한다', async () => {
    const user = userEvent.setup();
    const handleSelectMethod = vi.fn();

    renderCheckoutPaymentButton({
      selectedMethod: 'test',
      onSelectMethod: handleSelectMethod,
    });

    const testPaymentButton = screen.getByRole('button', {
      name: /테스트 결제/,
    });
    const demoPaymentButton = screen.getByRole('button', {
      name: /데모 결제/,
    });

    expect(testPaymentButton).toHaveAttribute('aria-pressed', 'true');
    expect(demoPaymentButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(demoPaymentButton);

    expect(handleSelectMethod).toHaveBeenCalledOnce();
    expect(handleSelectMethod).toHaveBeenCalledWith('demo');
  });

  it('비활성 상태에서는 결제 수단을 변경하지 않는다', async () => {
    const user = userEvent.setup();
    const handleSelectMethod = vi.fn();

    renderCheckoutPaymentButton({
      selectedMethod: 'test',
      onSelectMethod: handleSelectMethod,
      disabled: true,
    });

    const paymentMethodButtons = screen.getAllByRole('button');
    paymentMethodButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });

    await user.click(
      screen.getByRole('button', {
        name: /데모 결제/,
      }),
    );

    expect(handleSelectMethod).not.toHaveBeenCalled();
  });
});
