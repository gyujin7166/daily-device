import { useCallback, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { signIn, useSession } from 'next-auth/react';

import { fetchApi } from '@shared/api/fetchApi';
import { toast } from '@shared/lib/toast';

import {
  buildPopupLoginUrl,
  getDemoLoginCallbackUrl,
  SOCIAL_LOGIN_COMPLETED_MESSAGE,
} from '../login';

import type { SocialProvider } from '../login';

type UseLoginPageStateParams = {
  callbackUrl?: string;
  error?: string;
  reason?: string;
};

export default function useLoginPageState({
  callbackUrl,
  error,
  reason,
}: UseLoginPageStateParams) {
  const { status, update } = useSession();
  const router = useRouter();
  const hasShownErrorToast = useRef(false);
  const hasShownReasonToast = useRef(false);
  const socialLoginTimerRef = useRef<number | null>(null);
  const hasRequestedSessionRefreshRef = useRef(false);
  const [isDemoSigningIn, setIsDemoSigningIn] = useState(false);
  const clearSocialLoginTimer = useCallback(() => {
    if (socialLoginTimerRef.current !== null) {
      window.clearInterval(socialLoginTimerRef.current);
      socialLoginTimerRef.current = null;
    }
  }, []);

  const redirectAfterAuthenticated = useCallback(() => {
    router.replace(callbackUrl || '/');
    router.refresh();
  }, [callbackUrl, router]);

  const refreshSessionAfterSocialLogin = useCallback(async () => {
    if (hasRequestedSessionRefreshRef.current) {
      return;
    }

    hasRequestedSessionRefreshRef.current = true;

    try {
      await update();
    } catch {
      // Popup close and session refresh can race in the browser.
    } finally {
      window.setTimeout(() => {
        hasRequestedSessionRefreshRef.current = false;
      }, 250);
    }
  }, [update]);

  const handleSocialLogin = async (providerId: SocialProvider) => {
    if (typeof window === 'undefined') {
      return;
    }

    const width = 520;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      buildPopupLoginUrl(providerId),
      'social-login',
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    if (!popup) {
      await signIn(providerId, { callbackUrl });
      return;
    }

    clearSocialLoginTimer();
    hasRequestedSessionRefreshRef.current = false;
    popup.focus();

    socialLoginTimerRef.current = window.setInterval(() => {
      if (popup.closed) {
        clearSocialLoginTimer();
        void refreshSessionAfterSocialLogin();
      }
    }, 500);
  };

  const handleDemoLogin = async () => {
    if (isDemoSigningIn) {
      return;
    }

    setIsDemoSigningIn(true);

    try {
      const result = await fetchApi<{ url: string }>('/api/auth/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callbackUrl: getDemoLoginCallbackUrl(callbackUrl),
        }),
      });

      await update();
      router.replace(result.url || getDemoLoginCallbackUrl(callbackUrl));
      router.refresh();
    } catch {
      toast.error('데모 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsDemoSigningIn(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      redirectAfterAuthenticated();
    }
  }, [status, redirectAfterAuthenticated]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) {
        return;
      }

      void update().then((nextSession) => {
        if (nextSession?.user) {
          redirectAfterAuthenticated();
        }
      });
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [redirectAfterAuthenticated, update]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (event.data !== SOCIAL_LOGIN_COMPLETED_MESSAGE) {
        return;
      }

      clearSocialLoginTimer();
      void refreshSessionAfterSocialLogin();
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [clearSocialLoginTimer, refreshSessionAfterSocialLogin]);

  useEffect(() => {
    return () => {
      clearSocialLoginTimer();
    };
  }, [clearSocialLoginTimer]);

  useEffect(() => {
    if (hasShownReasonToast.current || reason !== 'wishlist') {
      return;
    }

    hasShownReasonToast.current = true;
    toast.info('찜 기능은 로그인 후 사용할 수 있습니다.');
  }, [reason]);

  useEffect(() => {
    if (hasShownErrorToast.current || !error) {
      return;
    }

    hasShownErrorToast.current = true;

    if (error === 'OAuthAccountNotLinked') {
      toast.error(
        '이미 다른 로그인 방식으로 가입된 이메일입니다. 처음 사용한 로그인 방식으로 다시 로그인해주세요.',
      );
      return;
    }

    toast.error('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }, [error]);

  return {
    handleDemoLogin,
    handleSocialLogin,
    isDemoSigningIn,
  };
}
