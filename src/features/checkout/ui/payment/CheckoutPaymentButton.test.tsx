import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import CheckoutPaymentButton from './CheckoutPaymentButton';

describe('CheckoutPaymentButton', () => {
  it('선택된 결제 수단을 표시하고 다른 결제 수단을 선택한다', async () => {
    const user = userEvent.setup();
    const handleSelectMethod = vi.fn();

    render(
      <CheckoutPaymentButton
        selectedMethod="test"
        onSelectMethod={handleSelectMethod}
      />,
    );

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

    render(
      <CheckoutPaymentButton
        selectedMethod="test"
        onSelectMethod={handleSelectMethod}
        disabled
      />,
    );

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
