import useLoginPageState from '@features/auth/model/hooks/useLoginPageState';
import { LoginContentSection } from '@features/auth/ui';

type LoginMainContentProps = {
  callbackUrl?: string;
  error?: string;
  reason?: string;
};

export default function LoginMainContent({
  callbackUrl,
  error,
  reason,
}: LoginMainContentProps) {
  const {
    handleDemoLogin,
    handleSocialLogin,
    isDemoSigningIn,
    loginContentRenderKey,
  } =
    useLoginPageState({
      callbackUrl,
      error,
      reason,
    });

  return (
    <div className="min-h-screen bg-surface text-ink dark:bg-dark-bg dark:text-surface">
      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 items-center justify-center bg-canvas dark:bg-dark-bg">
          <LoginContentSection
            key={loginContentRenderKey}
            onSocialLogin={handleSocialLogin}
            onDemoLogin={handleDemoLogin}
            isDemoSigningIn={isDemoSigningIn}
          />
        </main>
      </div>
    </div>
  );
}
