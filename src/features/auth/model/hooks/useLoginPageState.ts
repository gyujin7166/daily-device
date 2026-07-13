import { useCallback, useEffect, useRef, useState } from 'react';

import { signIn, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { fetchApi } from '@shared/api/fetchApi';
import { useRouter } from '@shared/lib/i18n/navigation';
import { toast } from '@shared/lib/toast';

import {
  buildPopupLoginUrl,
  getDemoLoginCallbackUrl,
  getSocialLoginErrorMessage,
  SOCIAL_LOGIN_COMPLETED_MESSAGE,
  SOCIAL_LOGIN_ERROR_MESSAGE,
} from '../login';

import type { SocialLoginErrorMessage, SocialProvider } from '../login';

type UseLoginPageStateParams = {
  callbackUrl?: string;
  error?: string;
  reason?: string;
};

const isSocialLoginErrorMessage = (
  value: unknown,
): value is SocialLoginErrorMessage => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'error' in value &&
    value.type === SOCIAL_LOGIN_ERROR_MESSAGE &&
    typeof value.error === 'string'
  );
};

export default function useLoginPageState({
  callbackUrl,
  error,
  reason,
}: UseLoginPageStateParams) {
  const t = useTranslations('Auth');
  const { status, update } = useSession();
  const router = useRouter();
  const hasShownErrorToast = useRef(false);
  const hasShownReasonToast = useRef(false);
  const socialLoginTimerRef = useRef<number | null>(null);
  const hasRequestedSessionRefreshRef = useRef(false);
  const [isDemoSigningIn, setIsDemoSigningIn] = useState(false);
  const [loginContentRenderKey, setLoginContentRenderKey] = useState(0);
  const getTranslatedSocialLoginErrorMessage = useCallback(
    (nextError: string) =>
      getSocialLoginErrorMessage(nextError, {
        accountNotLinked: t('errors.accountNotLinked'),
        defaultError: t('errors.loginFailed'),
      }),
    [t],
  );

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
      toast.error(t('errors.demoLoginFailed'));
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

      if (event.data === SOCIAL_LOGIN_COMPLETED_MESSAGE) {
        clearSocialLoginTimer();
        void refreshSessionAfterSocialLogin();
        return;
      }

      if (isSocialLoginErrorMessage(event.data)) {
        clearSocialLoginTimer();
        setLoginContentRenderKey((prevKey) => prevKey + 1);
        toast.error(getTranslatedSocialLoginErrorMessage(event.data.error));
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [
    clearSocialLoginTimer,
    getTranslatedSocialLoginErrorMessage,
    refreshSessionAfterSocialLogin,
  ]);

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
    toast.info(t('toast.wishlistLoginRequired'));
  }, [reason, t]);

  useEffect(() => {
    if (hasShownErrorToast.current || !error) {
      return;
    }

    hasShownErrorToast.current = true;

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        {
          type: SOCIAL_LOGIN_ERROR_MESSAGE,
          error,
        } satisfies SocialLoginErrorMessage,
        window.location.origin,
      );
      window.close();

      const fallbackTimer = window.setTimeout(() => {
        window.location.replace('/login');
      }, 500);

      return () => {
        window.clearTimeout(fallbackTimer);
      };
    }

    toast.error(getTranslatedSocialLoginErrorMessage(error));
  }, [error, getTranslatedSocialLoginErrorMessage]);

  return {
    handleDemoLogin,
    handleSocialLogin,
    isDemoSigningIn,
    loginContentRenderKey,
  };
}
