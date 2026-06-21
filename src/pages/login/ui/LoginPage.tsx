import { redirect } from 'next/navigation';

import type { SocialProvider } from '@features/auth/model/login';

import { auth } from 'auth';

import LoginPageContainer from './LoginPageContainer';

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
    reason?: string;
    popup?: string;
    provider?: SocialProvider;
  }>;
};

const getSafeCallbackUrl = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  if (value.startsWith('/')) {
    return value;
  }

  return '/';
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const {
    callbackUrl,
    error,
    reason,
    popup: popupMode,
    provider: popupProvider,
  } = await searchParams;
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl);

  if (popupMode !== '1' && popupMode !== 'close') {
    const session = await auth();
    if (session?.user?.id) {
      redirect(safeCallbackUrl ?? '/');
    }
  }

  return (
    <LoginPageContainer
      callbackUrl={safeCallbackUrl}
      error={error}
      reason={reason}
      popupMode={popupMode}
      popupProvider={popupProvider}
    />
  );
}
