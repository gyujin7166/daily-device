'use client';
import type { SocialProvider } from '@features/auth/model/login';

import LoginMainContent from './LoginMainContent';
import PopupLoginBridge from './PopupLoginBridge';

type LoginPageContainerProps = {
  callbackUrl?: string;
  reason?: string;
  popupMode?: string;
  popupProvider?: SocialProvider;
};

export default function LoginPageContainer({
  callbackUrl,
  reason,
  popupMode,
  popupProvider,
}: LoginPageContainerProps) {
  if (popupMode === '1' || popupMode === 'close') {
    return (
      <PopupLoginBridge
        callbackUrl={callbackUrl}
        popupMode={popupMode}
        popupProvider={popupProvider}
      />
    );
  }

  return <LoginMainContent callbackUrl={callbackUrl} reason={reason} />;
}
