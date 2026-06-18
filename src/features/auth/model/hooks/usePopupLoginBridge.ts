import { useEffect, useRef } from 'react';

import { signIn } from 'next-auth/react';

import { SOCIAL_LOGIN_COMPLETED_MESSAGE } from '../login';

import type { SocialProvider } from '../login';

type UsePopupLoginBridgeParams = {
  callbackUrl?: string;
  popupMode?: string;
  popupProvider?: SocialProvider;
};

export default function usePopupLoginBridge({
  callbackUrl,
  popupMode,
  popupProvider,
}: UsePopupLoginBridgeParams) {
  const hasAutoSignedIn = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (popupMode !== '1' || !popupProvider || hasAutoSignedIn.current) {
      return;
    }

    hasAutoSignedIn.current = true;
    void signIn(popupProvider, { callbackUrl: '/login?popup=close' });
  }, [popupMode, popupProvider]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (popupMode !== 'close') {
      return;
    }

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        SOCIAL_LOGIN_COMPLETED_MESSAGE,
        window.location.origin,
      );
    }

    window.close();

    const fallbackTimer = window.setTimeout(() => {
      window.location.replace(callbackUrl || '/login');
    }, 500);

    return () => {
      window.clearTimeout(fallbackTimer);
    };
  }, [popupMode, callbackUrl]);
}
