/* eslint-disable @next/next/no-img-element */
import {
  DAILY_DEVICE_SYMBOL_SIZE,
  DAILY_DEVICE_SYMBOL_SRC,
} from '@shared/constants/images';

import SocialLoginButton from './SocialLoginButton';

import type { SocialProvider } from '../model/login';

type LoginContentSectionProps = {
  onSocialLogin: (providerId: SocialProvider) => void;
  onDemoLogin: () => void;
  isDemoSigningIn?: boolean;
};

export default function LoginContentSection({
  onSocialLogin,
  onDemoLogin,
  isDemoSigningIn = false,
}: LoginContentSectionProps) {
  return (
    <div className="flex w-full items-center justify-center px-4">
      <section className="w-full max-w-md rounded-xl border border-line bg-surface p-8 shadow-xl dark:border-dark-border dark:bg-dark-panel">
        <div className="flex flex-col items-center gap-2 pb-6 text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center">
            <img
              src={DAILY_DEVICE_SYMBOL_SRC}
              alt=""
              width={DAILY_DEVICE_SYMBOL_SIZE.width}
              height={DAILY_DEVICE_SYMBOL_SIZE.height}
              className="h-7 w-auto select-none object-contain dark:invert"
              draggable={false}
              aria-hidden="true"
            />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink dark:text-surface">
            로그인
          </h1>
          <p className="text-sm text-muted dark:text-dark-muted">
            원하는 소셜 계정으로 로그인하세요.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onDemoLogin}
            disabled={isDemoSigningIn}
            className="relative flex h-12 w-full items-center justify-center rounded-md border border-primary bg-primary-soft px-4 text-base font-semibold text-primary transition hover:bg-primary hover:text-surface disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 dark:bg-blue-900/30 dark:text-blue-300"
          >
            {isDemoSigningIn ? '데모 로그인 중...' : '데모 로그인'}
          </button>
          <SocialLoginButton
            provider="google"
            onClick={() => onSocialLogin('google')}
          />
          <SocialLoginButton
            provider="naver"
            onClick={() => onSocialLogin('naver')}
          />
          <SocialLoginButton
            provider="kakao"
            onClick={() => onSocialLogin('kakao')}
          />
        </div>

        <p className="pt-4 text-center text-xs text-muted dark:text-dark-muted">
          데모 로그인으로 주문/결제 플로우를 바로 테스트할 수 있습니다.
        </p>

        <p className="pt-6 text-center text-xs leading-relaxed text-muted dark:text-dark-muted">
          계속 진행하면{' '}
          <button
            type="button"
            className="underline underline-offset-2 transition-colors hover:text-ink dark:hover:text-surface"
          >
            이용약관
          </button>{' '}
          및{' '}
          <button
            type="button"
            className="underline underline-offset-2 transition-colors hover:text-ink dark:hover:text-surface"
          >
            개인정보처리방침
          </button>
          에 동의하게 됩니다.
        </p>
      </section>
    </div>
  );
}
