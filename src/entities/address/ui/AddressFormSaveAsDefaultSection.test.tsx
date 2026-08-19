import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TestIntlProvider } from '../../../../test/render';

import AddressFormSaveAsDefaultSection from './AddressFormSaveAsDefaultSection';

const messages = {
  MyAddress: {
    createModal: {
      saveAsDefault: 'Set as default address',
      saveAsDefaultDescription:
        'Use this address as your default shipping address.',
    },
  },
};

describe('AddressFormSaveAsDefaultSection', () => {
  it('이름이 있는 switch를 키보드로 변경한다', async () => {
    const user = userEvent.setup();
    const onSaveAsDefaultChange = vi.fn();

    render(
      <TestIntlProvider locale="en" messages={messages}>
        <AddressFormSaveAsDefaultSection
          saveAsDefault={false}
          isSaving={false}
          onSaveAsDefaultChange={onSaveAsDefaultChange}
        />
      </TestIntlProvider>,
    );

    const defaultSwitch = screen.getByRole('switch', {
      name: 'Set as default address',
    });

    await user.tab();
    expect(defaultSwitch).toHaveFocus();

    await user.keyboard(' ');
    expect(onSaveAsDefaultChange).toHaveBeenCalledWith(true);

    onSaveAsDefaultChange.mockClear();
    await user.keyboard('{Enter}');
    expect(onSaveAsDefaultChange).toHaveBeenCalledWith(true);
  });
});
