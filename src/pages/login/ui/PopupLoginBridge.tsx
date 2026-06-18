import usePopupLoginBridge from '@features/auth/model/hooks/usePopupLoginBridge';
import type { SocialProvider } from '@features/auth/model/login';

import Spinner from '@shared/ui/Loading/Spinner/Spinner';

type PopupLoginBridgeProps = {
  callbackUrl?: string;
  popupMode?: string;
  popupProvider?: SocialProvider;
};

export default function PopupLoginBridge({
  callbackUrl,
  popupMode,
  popupProvider,
}: PopupLoginBridgeProps) {
  usePopupLoginBridge({
    callbackUrl,
    popupMode,
    popupProvider,
  });

  return (
    <div className="min-h-screen bg-surface text-ink dark:bg-dark-bg dark:text-surface">
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    </div>
  );
}
