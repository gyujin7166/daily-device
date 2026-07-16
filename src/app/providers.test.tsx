import type { PropsWithChildren } from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { toast } from '@shared/lib/toast';

import Providers from './providers';

vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: PropsWithChildren) => children,
}));

vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => null,
}));

type ToastTriggerProps = {
  message: string;
  type: 'success' | 'error';
};

function ToastTrigger({ message, type }: ToastTriggerProps) {
  return (
    <button
      type="button"
      onClick={() => toast[type](message, { autoClose: false })}
    >
      Show toast
    </button>
  );
}

afterEach(() => {
  toast.dismiss();
  toast.clearWaitingQueue();
});

describe('Providers toast i18n context', () => {
  it.each([
    {
      locale: 'ko',
      type: 'success' as const,
      message: '기본 배송지로 설정했습니다.',
      closeLabel: '토스트 메시지 닫기',
    },
    {
      locale: 'en',
      type: 'error' as const,
      message: 'Failed to update the address.',
      closeLabel: 'Close notification',
    },
  ])(
    '$locale 환경에서 $type Toast를 표시하고 닫는다',
    async ({ locale, type, message, closeLabel }) => {
      const user = userEvent.setup();
      const messages = {
        Common: {
          toast: {
            close: closeLabel,
          },
        },
      };

      render(
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <ToastTrigger message={message} type={type} />
          </Providers>
        </NextIntlClientProvider>,
      );

      await user.click(screen.getByRole('button', { name: 'Show toast' }));

      const toastMessage = await screen.findByText(message, { exact: true });
      const closeButton = screen.getByRole('button', { name: closeLabel });
      const toastElement = toastMessage.closest('[data-in]');

      expect(toastMessage).toBeInTheDocument();
      expect(closeButton).toBeInTheDocument();
      expect(toastElement).toHaveAttribute('data-in', 'true');

      await user.click(closeButton);
      await waitFor(() => {
        expect(toastElement).toHaveAttribute('data-in', 'false');
      });
    },
  );
});
