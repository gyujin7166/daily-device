type TossPayments = (clientKey: string) => {
  requestPayment: (
    method: string,
    params: Record<string, unknown>,
  ) => Promise<void> | void;
};

declare global {
  interface Window {
    TossPayments?: TossPayments;
  }
}

export const loadTossPayments = (
  loadFailedMessage = 'Could not load TossPayments SDK.',
) =>
  new Promise<TossPayments>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('TossPayments is not available on the server.'));
      return;
    }

    if (window.TossPayments) {
      resolve(window.TossPayments);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment';
    script.async = true;
    script.onload = () => {
      if (window.TossPayments) {
        resolve(window.TossPayments);
      } else {
        reject(new Error(loadFailedMessage));
      }
    };
    script.onerror = () => reject(new Error(loadFailedMessage));
    document.head.appendChild(script);
  });
