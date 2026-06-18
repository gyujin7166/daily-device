import useLoginPageState from '@features/auth/model/hooks/useLoginPageState';
import { LoginContentSection } from '@features/auth/ui';

import LogoHeader from '@shared/ui/Header/LogoHeader';

type LoginMainContentProps = {
  callbackUrl?: string;
  reason?: string;
};

export default function LoginMainContent({
  callbackUrl,
  reason,
}: LoginMainContentProps) {
  const { handleDemoLogin, handleSocialLogin, isDemoSigningIn } =
    useLoginPageState({
      callbackUrl,
      reason,
    });

  return (
    <div className="min-h-screen bg-surface text-ink dark:bg-dark-bg dark:text-surface">
      <div className="flex min-h-screen flex-col">
        <LogoHeader />
        <main className="-mt-14.5 flex flex-1 items-center justify-center bg-canvas dark:bg-dark-bg md:-mt-22 lg:-mt-26">
          <LoginContentSection
            onSocialLogin={handleSocialLogin}
            onDemoLogin={handleDemoLogin}
            isDemoSigningIn={isDemoSigningIn}
          />
        </main>
      </div>
    </div>
  );
}
