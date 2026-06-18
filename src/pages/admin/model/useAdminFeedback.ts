import { useCallback, useState } from 'react';

import { toast } from '@shared/lib/toast';

const READ_ONLY_ADMIN_MESSAGE =
  '일반 계정은 관리자 데이터를 수정할 수 없습니다.';

export const useAdminFeedback = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const showMessage = useCallback((nextMessage: string) => {
    setError('');
    setMessage(nextMessage);
  }, []);

  const showError = useCallback((nextError: string) => {
    setMessage('');
    setError(nextError);
  }, []);

  const showReadOnlyNotice = useCallback(() => {
    toast.info(READ_ONLY_ADMIN_MESSAGE);
  }, []);

  return {
    message,
    error,
    showMessage,
    showError,
    showReadOnlyNotice,
  };
};
